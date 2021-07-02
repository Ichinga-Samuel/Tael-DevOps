const fs = require("fs");
const path = require("path");

const connectDB = require('../config/db');
const {cloudUpload} = require("./cloudstorage");
const Book = require("../models/Books");
const Author = require("../models/Authors");

let conn = connectDB();

async function bookUpload(path, extra={}) {
    // Convert the data files of each dir to json object then upload them to the database
    try{
        let fo = await fs.promises.readFile(path);   // read the data file of the book
        let fd = JSON.parse(fo);
        fd = {...fd, ...extra};
        let authors = fd.authors;
        let autids = authors.map(async name => {
            return Author.findOneAndUpdate({name: name}, {name: name}, {upsert: true, new: true});
        });
        fd.authors = await Promise.all(autids);
        let book = await Book.create(fd);
        for (const id of fd.authors) {
            await Author.findByIdAndUpdate(id, {$push: {books: book.id}}, {upsert: true});
        }
    }
    catch(e){
        console.log(e)
    }

}

async function authorUpload(path, extra={}) {
    try{
        let fo = await fs.promises.readFile(path);   // read the data file of the author
        let fd = JSON.parse(fo);
        fd = {...fd, ...extra};
        await Author.findOneAndUpdate({name: fd.name}, fd, {upsert: true});
    }
    catch (e) {
        console.log(e)
    }

}

async function dirUpload(dir){
    try{
        let uploaders = {Books: [Book, bookUpload], Authors: [Author, authorUpload]};
        let obj = {};
        let destination = dir.split('\\').slice(-3);  // assuming windows file system
        let folder = destination[1];
        destination = destination.join('/');
        let [model, uploader] = uploaders[folder];
        let files = await fs.promises.readdir(dir);
        let meta;
        for await (let file of files){
            if(file.includes('File')){
                [obj.fileUrl, obj.fileSize] = await cloudUpload(path.join(dir, file), `${destination}/${file}`);
            }
            else if(file.includes('Image')){
                obj.imageUrl = await cloudUpload(path.join(dir, file), `${destination}/${file}`);
            }
            else {meta = file;}
        }
        meta = path.join(dir, meta);
        await uploader(meta, obj)
    }
    catch (e) {
        console.log(e)
    }
}

async function upload(dir){
    try {
        let folders = await fs.promises.readdir(dir);
        for await (let fol of folders){
            await dirUpload(path.join(dir, fol))    // Set folder to author when uploading author information
        }
        process.exit(0)
    }
    catch (e) {
        console.log(e)
        process.exit(0)
    }
}

let dir = process.argv[2];
upload(dir);
