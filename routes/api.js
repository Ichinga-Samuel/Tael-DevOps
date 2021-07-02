const express = require('express');
const router = express.Router();
const books = require('../models/Books');
const authors = require('../models/Authors');
const reviews = require("../models/Review");
const {isUser} = require('./helpers/authenticate');

let exclude = {updatedAt: 0};
function pattern (q){
    let bad = ['the', 'and', "your", 'you', 'our', 'when', 'what', 'where', 'ours', 'yours'];
    q = q.toLocaleLowerCase();
    let queries = q.split(' ');
    queries = queries.filter(i => i.length >= 3 && !(bad.includes(i)));
    queries.sort((a, b) => b.length - a.length);
    queries.unshift(q);
    queries = queries.join('|');
    return new RegExp(`${queries}`, 'i')
}
async function format(arr){
    let books = arr.books;
    if(!books){return []}
    for await (let book of books){
        let author = book.authors.map(async i => {return authors.findById(i, {name: 1, imageUrl: 1});})
        book.authors = await Promise.all(author)
    }
    return books
}
router.get('/books/popular',async (req, res) => {
    try{
    const books_ = await books.find().select(exclude)
                              .sort('-year').limit(10).populate('reviews').populate({path: 'authors', select: 'name imageUrl'}).lean();
    res.json(books_);}
    catch (e) {
        res.status(500).send({msg: "Something went wrong", status: false})
    }
});

router.get('/books/similar/:id', async (req, res) =>{
    try{
        let include = {year:1, branch:1, genres:1, language:1}
        let id = req.params['id']
        let book = await books.findById(id).select(include).sort('-year').populate('reviews').populate({path: 'authors', select: 'name'}).lean();
        let result = await books.find({genres: {$in: book.genres}}).select(exclude).sort('-downloads -year').limit(10)
            .populate('reviews').populate({path: 'authors', select: 'name imageUrl'}).lean();
        res.json(result)
    }
    catch (e) {
        res.status(500).send({msg: "Something went wrong", status: false})
    }
})

router.get('/books/get/:id', async (req, res) =>{
    try{
        let id = req.params['id']
        let book = await books.findById(id).select(exclude).sort('-year').populate('reviews').populate({path: 'authors', select: 'name imageUrl id'}).lean();
        res.json(book)
    }
    catch (e) {
        res.status(500).send({msg: "Something went wrong", status: false})
    }

});
router.get('/books/search', async (req, res) =>{
    try {
    let q = req.query.q;
    let reg = new RegExp(`.*?${q}.*?`, 'i')
    let regexp = pattern(q);
    let resp = await authors.find({name: reg}).select({name:1, books:1}).populate({path: 'books', select: exclude, populate:{path: 'reviews'}}).lean();
    let results = await books.find({$or:[{title: regexp}, {summary: regexp}, {genres: {$in:[regexp]}}]})
                               .select(exclude).limit(10).populate('reviews').populate({path: 'authors', select: 'name id'}).lean();
    for await(let r of resp){
        let books = await format(r);
        results.push(...books);
    }
    res.json(results);
    }
    catch(e){
        res.status(500).send({msg: "Something went wrong", status: false})
    }

});
router.get('/authors/get/:id', async (req, res) =>{
    try{
        let id = req.params['id']
        let book = await authors.findById(id).select(exclude).sort('name').populate({path: 'books', select: 'title imageUrl id'}).lean();
        res.json(book)
    }
    catch (e) {
        res.status(500).send({msg: "Something went wrong", status: false})
    }
})

router.get('/authors/search', async (req, res) => {
    try{
        let q = req.query.q;
        let regexp = pattern(q);
        const results = await authors.find({name: regexp}).populate({path: 'books', select: 'title imageUrl'}).lean();
        res.json(results)
    }
    catch (e){
        res.status(500).send({msg: "Something went wrong", status: false})
    }
});

router.get('/authors/all',async (req, res) => {
    try{
        const results = await authors.find().populate({path: 'books', select: 'title imageUrl'}).lean();
        res.json(results)
    }
    catch (e) {
        res.status(500).send({msg: "Something went wrong", status: false})
    }
});


router.post('/reviews', async (req, res) => {
    try{
        let rev = await reviews.create(req.body)
        res.json({status: true})

    }
    catch(e){
        res.status(500).send({msg: "Something went wrong", status: false})



    }
})

router.get('/books/downloads/:id', async (req, res) => {
    try{
        let id = req.params['id']
        let book = await books.findByIdAndUpdate(id, {$inc:{downloads: 1}, new: true})
        res.json({status: true, id: id})
    }
    catch (e) {
        res.status(500).send({msg: "Something went wrong", status: false})
    }
})

router.get('/search', async (req, res) => {
    try {
        let q = req.query.q;
        let reg = new RegExp(`.*?${q}.*?`, 'i')
        let regexp = pattern(q);
        const author = await authors.find({name: reg}).limit(10).lean();
        let book = await books.find({$or:[{title: regexp}, {summary: regexp}, {genres: {$in:[regexp]}}]})
            .select(exclude).limit(10).lean();

        let result = {authors: author, books: book}
        res.json(result);
    }
    catch(e){
        res.status(500).send({msg: "Something went wrong", status: false})
    }
})

router.get('/guide', (req, res) => {
    res.render('api')
})

module.exports = router;
