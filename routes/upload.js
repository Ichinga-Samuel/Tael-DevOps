const express = require('express');
const {listCountries} = require('@odusanya/african-countries');
const {uploader, bookUpload, authorUpload} = require('./helpers/cloudupload')
const {isAdmin} = require('./helpers/authenticate');

const router = express.Router();
let countries = listCountries().map(c => c['Country Name'])

router.get('/book', isAdmin, (req, res) => {
    res.render('books')
});

router.post('/book', isAdmin,  uploader.array('book', 2), bookUpload, (req, res) => {
    res.redirect('/upload/book');
    });


router.get('/author', (req, res) =>{
    res.render('authors', {countries: countries})
})

router.post('/author', isAdmin, uploader.single('author'), authorUpload, async (req, res) => {
    res.redirect('/upload/author')
})

module.exports = router