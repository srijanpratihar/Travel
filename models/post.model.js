let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let postSchema = new Schema({
    title: String,
    date: Date,
    description: String,
    text: String,
    country: String,
    images: [{
        url: String,
        filename: String
    }],
    info: String,
    price: Number

});

let users = new Schema({
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true
    }
})

let Call = new Schema({
    name: String,
    phone: Number,
    message: String
})


let Callme = new Schema({
    phone: Number
})

let Post = mongoose.model('Post', postSchema);
let User = mongoose.model('user', users);
let call = mongoose.model('call', Call);
let callme = mongoose.model('callme', Callme);


module.exports = { Post, User, call, callme };