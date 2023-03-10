const cloudinary = require('cloudinary').v2;
1

require('dotenv').config();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const express = require('express');
const multer = require('multer');
cloudinary.config({
    cloud_name: 'daexfwdsa',
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Application',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = { cloudinary, storage }