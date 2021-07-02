const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title:{
        type: String,
    },
    language:{
        type: String,
        default: 'English'
    },
    year: Number,
    genres: Array,
    branch: String,
    summary:{
        type: String,
    },
    pages: Number,
    imageUrl: String,
    fileUrl: String,
    fileType: String,
    fileSize: {
        type: Number,

    },
    ratings: {
        type: Number,
        default: 3
    },
    authors: [{
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Author'
    }],
    downloads:{
        type: Number,
        default: 0,
    }
}, {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}});

BookSchema.virtual('reviews', {
    ref: "Review",
    localField: "title",
    foreignField: "book",
    justOne: false,
    options:{sort: {createdAt: 1}}
});


module.exports = mongoose.model('Books', BookSchema);
