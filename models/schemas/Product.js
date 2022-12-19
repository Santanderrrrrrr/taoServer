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
    brandId:{
        type: ObjectID,
        required: true,
        ref: 'Brand'
    },
    inventory:{
        type: Number,
        required: false,
        default: 1
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
     condition: {
       type: String,
       enum: ["new", "used", "slightly damaged", "damaged", "very old"],
       default:"used",
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

productSchema.index({
    // '$**': 'text'
    name: "text",
    description: "text",
    // brand: "text",
  })

  

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
