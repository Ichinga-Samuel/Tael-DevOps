const mongoose = require('mongoose');

const {genPwd, isValid} = require('../config/pass');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        },
    email:{
        type: String,
        index: {unique: true},
        required: true,
    },
    password:{
        hash: {
            type: String,
            required: true
        },
        salt: String,

    },
    verified: {type: Boolean, default: false},
    admin: {type: Boolean, default: false},
    favourites: Array
}, {timestamps: true, toObject: {virtuals: true}, toJSON: {virtuals: true}});

UserSchema.virtual('reviews', {
    ref: "Review",
    localField: "email",
    foreignField: "email",
    justOne: false
});

UserSchema.virtual('fave', {
    ref: "Books",
    localField: "favourites",
    foreignField: "title",
    justOne: false,
    options:{sort: {title: 1}}
});

const User = mongoose.model('Users', UserSchema);

module.exports = User;





