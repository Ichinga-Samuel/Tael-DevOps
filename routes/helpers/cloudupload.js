const fetch = require("node-fetch");
const multer = require("multer");
const googleMulter = require("multer-cloud-storage");
const Books = require("../../models/Books");
const Authors = require("../../models/Authors")


uploader = multer(
    {
        storage: googleMulter.storageEngine({
            acl: "publicRead",
            autoRetry: true,
            bucket: process.env.GCS_BUCKET,
            destination: function (req, file, cb) {
                let fn = file.originalname;
                if(fn.includes('File')){
                    req.body.fileType = fn.slice(fn.lastIndexOf('.')+1, );
                }
                let strip = (s, i)  => {
                    let f = s.lastIndexOf(i)
                    return s.slice(0, f).trim()
                };
                let fol = fn.includes('-') ? strip(fn, '-') : strip(fn, '.');
                let b = req.path;
                b = b.charAt(1).toUpperCase() + b.slice(2,) + 's';
                dest = `The African Ebook Library/${b}/${fol}`;
                cb(null, dest)
            },
            projectId: process.env.GCLOUD_PROJECT,
            keyFilename: process.env.GCS_KEYFILE,
            uniformBucketLevelAccess: false,
        })
    }
);


async function bookUpload(req, res, next) {
    try{
        let links = req.files.map(async (m) => {
            let b = fetch(m.selfLink).then(res => res.json()).then(data =>  [data.mediaLink, data.size]);
            return Promise.resolve(b)
        });
        let [a, b] = await Promise.all(links);
        if (a && b){
            [req.body.fileUrl, req.body.fileSize] = a[0].includes('Image') ? [b[0], b[1]] : [a[0], a[1]];
            req.body.imageUrl = a[0].includes('Image') ? a[0]: b[0];}
        let genres = req.body.genres.split(',');
        genres.forEach(g => g.trim());
        let authors = req.body.authors.split(',');
        authors.forEach(g => g.trim());
        let auth = authors.map(async name => {
            let author = await Authors.findOneAndUpdate({name: name}, {name: name}, {upsert: true, new: true});
            return author._id
        });
        auth = await Promise.all(auth);
        req.body.authors = auth;
        req.body.genres = genres;
        let book = await Books.create(req.body);
        for await (const id of auth) {
            await Authors.findByIdAndUpdate(id, {$push: {books: book.id}}, {upsert: true});
        }
        res.locals.bookMsg = "Book Successfully Uploaded";
        return next()
    }
    catch (e) {
        res.locals.bookMsg = "Unable to Save to Database. Try Again!"
        return next(e)
    }


}

async function authorUpload(req, res, next){
    try{
        let file = req.file;
        let fu = fetch(file.selfLink).then(res => res.json()).then(data => {req.body.imageUrl = data.mediaLink});
        await Promise.resolve(fu);
        req.body.name = `${req.body.firstname.trim()} ${req.body.lastname.trim()}`
        delete req.body.firstname;
        delete req.body.lastname;
        await Authors.findOneAndUpdate({name:req.body.name}, req.body, {upsert: true, new: true});
        return next()
    }
    catch (e) {
        return next(e)
    }

}
module.exports = {uploader, bookUpload, authorUpload};
