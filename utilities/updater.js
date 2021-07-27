const connectDB = require('../config/db');
const dotenv  = require('dotenv');
const Book = require("../models/Books");
const Author = require("../models/Authors");

dotenv.config({path:'../config/config.env'});       // change path to absolute path when running from shell
let conn = connectDB();


async function authorLink(){
    /*
    Enable many to many relationship by linking Authors the books the have written
     */
    try {
        let books = await Book.find({}, {authors:1});
        for await(let book of books){
            for await (let a of book.authors){
                let aut = await Author.findByIdAndUpdate(a, {$push:{books: book._id}}, {new: true, upsert: true})
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}

// authorLink();

const updates = [
     {match:{name:"Chinua Achebe"}, update:{birthdate: "1930-11-16"}},
     {match:{name: "Buchi Emecheta"}, update: {birthdate: "1944-07-21"}},
     {match:{name: "Chimamanda Ngozi Adichie"}, update:{birthdate: "1977-09-15"}},
     {match:{name: "Elechi Amadi"}, update:{birthdate: "1934-05-12"}},
     {match:{name: "Flora Nwapa"}, update: {birthdate: "1931-01-13"}},
     {match:{name: "Ngũgĩ wa Thiong'o"}, update: {birthdate: "1938-01-5"}},
     {match:{name: "Shola Shoneyin"}, update: {name: "Lola Shoneyin"}}
];

async function authorUpdater(update) {
    try {
        for await (let u of update){
            await Author.findOneAndUpdate(u.match, u.update, {upsert: true})
        }
    }
    catch (e) {
        console.log(e);
    }
    finally {
        console.log('done');
        process.exit(0);
    }

};

async function booksUpdater(){
    try{
        console.log('starting')
        let b = await Book.updateMany({}, {ratings: 1}, {upsert: true});
        console.log('complete', b.nModified, b.nMatched)
    }
    catch (e) {
        console.log(e)
    }
    finally {
        console.log('done');
        process.exit(0);
    }
}

async function updateRatings(){
    try{
        console.log('starting');
        let books = await Book.updateMany({}, {ratings: {1:1, 2:1, 3:1, 4:1, 5:1}})
        console.log(books.nModified)
    }

    catch (e) {
            console.log(e)
        }
    finally {
            console.log('done');
            process.exit(0);
        }
}

updateRatings()
// booksUpdater()
// authorUpdater(updates);
