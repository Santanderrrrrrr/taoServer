const mongoose = require('mongoose')

const likeSchema = new mongoose.Schema({
    user:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,	
    },
    product:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
        required: true,
    }
}, {minimize: false, timestamps: true})

const Like = mongoose.model('Like', likeSchema)

module.exports = Like