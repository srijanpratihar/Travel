let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let postSchema = new Schema({
    title: String,
    date: Date,
    description: String,
    text: String,
    country: String,
    imageUrl: String
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

let Post = mongoose.model('Post', postSchema);
let User = mongoose.model('user', users);
let call = mongoose.model('call', Call);

module.exports = { Post, User, call };