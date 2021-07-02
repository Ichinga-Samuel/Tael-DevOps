const {Storage} = require("@google-cloud/storage");
const dotenv  = require('dotenv');

const storage = new Storage({keyFilename: "../config/tael-313422-f0de8e38a314.json"}); // change path to absolute path when running from shell
dotenv.config({path:'../config/config.env'});       // change path to absolute path when running from shell

const connectDB = require('../config/db');

const Books = require('../models/Books');
const Authors = require('../models/Authors');

let conn = connectDB();

const bucket_id = process.env.GCS_BUCKET;
const bucket = storage.bucket(bucket_id);

let options = {
    prefix: "The African Ebook Library/Books/"
    };

async function cloudUpload(path, destination) {
    try{
        const [file] = await bucket.upload(path, {destination, public: true, predefinedAcl: "publicRead"});
        const [meta] = await file.getMetadata();
        return [meta.mediaLink, meta.size]
    }
    catch (e) {
        console.log(e)
    }

}


async function listFiles(options){
    /**
     * This can be used to list all blobs in a "folder", e.g. "public/".
     *
     * The delimiter argument can be used to restrict the results to only the
     * "files" in the given "folder". Without the delimiter, the entire tree under
     * the prefix is returned. For example, given these blobs:
     *
     *   /a/1.txt
     *   /a/b/2.txt
     *
     * If you just specify prefix = 'a/', you'll get back:
     *
     *   /a/1.txt
     *   /a/b/2.txt
     *
     * However, if you specify prefix='a/' and delimiter='/', you'll get back:
     *
     *   /a/1.txt
     */
    try{
        let [files] = await bucket.getFiles(options);
        return files;
    }
    catch (e) {
        console.log(e)
    }
}

async function makePublic(options){
    try{
        let files = await listFiles(options);
        for await(let file of files){
            await bucket.file(file.name).makePublic()
        }
    }
    catch (e) {
        console.log(e)
    }

}

async function getMeta(options, model, type='image', match='title'){
    /*
    get meta properties from cloud files and update to database
    match is name when the model is the authors model and title when it is book
     */
    try {
        let files = await listFiles(options);
        files = files.filter(i => !(i.metadata.contentType.includes(type)));
        let find = {};
    for await (let file of files){
         find[match] = file.name.split('/')[2];
         await model.findOneAndUpdate(find, {fileSize:file.metadata.size }, {upsert: true})
    }
    }
    catch (e) {
        console.log(e)
    }
    finally {
        process.exit(0)
    }
}

getMeta(options, Books);

// makePublic(options)
module.exports = {cloudUpload};