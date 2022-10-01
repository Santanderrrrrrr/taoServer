const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId

const productSchema = new mongoose.Schema({
    sellerId:{
        type: ObjectID,
        required: true,
        ref: 'User'
    },
    categoryId: {
       type: ObjectID,
       required: true,
       ref: 'Category'
    },
    inventory:{
        type: Number,
        required: true,
    },
    discount:{
        type: String,
    },
    name: {
        type: String,
        required: true,
        trim: true
     },
     description: {
       type: String,
       required: true
     },
     price: {
        type: Number,
        required: true
     },
     images:{
        type:[String]
     }
    }, {
     timestamps: true,
     minimize: false
    }
)

const Product = mongoose.model('Product', productSchema)
module.exports = Product
