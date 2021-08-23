const { assert } = require('chai')
const chai = require('chai')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

const db = require('../config/db')
const Books = require('../models/Books')

dotenv.config({path: './config/config.env'})

let conn = db()

describe('Backend Tests', function(){
    // before(async function(){
    //     
    
    // })
    after(async function(){
        mongoose.connection.close(function(){
            console.log('Mongoose disconnected through app termination');
        })
    })
    describe('Find books by title', function(){
        it('Find books titled Things Fall Apart', async function(){
            let books = await Books.find({title:"Things Fall Apart"})
            assert.isArray(books)
            assert(books[0].title, "Things Fall Apart", "Book title is Things Fall Apart")
        })
    })
})