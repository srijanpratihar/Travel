const cloudinary = require('cloudinary').v2;
1

require('dotenv').config();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const express = require('express');
const multer = require('multer');
cloudinary.config({
    cloud_name: 'daexfwdsa',
    api_key:'871893526942547',
    api_secret:'TO2TPx8rpdXvNYxsFMWUpv_FXRI'
});


const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Application',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = { cloudinary, storage }
