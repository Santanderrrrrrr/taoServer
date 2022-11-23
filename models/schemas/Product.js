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
    sizeId: {
       type: ObjectID,
       required: true,
       ref: 'Size'
    },
    genderId:{
        type: ObjectID,
        required: true,
        ref: 'Gender'
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
     },
     likes: [{
        type:ObjectID,
        ref: 'Like'
     }]
    }, {
     timestamps: true,
     minimize: false
    }
)

// productSchema.methods.toJSON = function(){
//     const product = this;
//     // product.populate('sellerId')
//     // console.log(product.sellerId.firstname)
//     productObject = product.toObject();
//     // delete productObject.sellerId;
//     // delete productObject.categoryId;
//     productObject = {...productObject, seller: product.sellerId.name || 'failed'}
//     return productObject;
//   }

const Product = mongoose.model('Product', productSchema)
module.exports = Product
