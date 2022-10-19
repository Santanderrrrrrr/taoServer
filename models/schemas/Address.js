const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId

const addressSchema = new mongoose.Schema({
    userId:{
        type: ObjectID,
        ref: 'User',
        required: true
    },
    addressLine1:{
        type: String,
    },
    addressLine2:{
        type: String,
    },
    city:{
        type: String,
    },
    postalCode:{
        type: String,
    },
    country:{
        type: String,
    },
    phone:{
        type: String,
    },
})

const Address = mongoose.model('Address', addressSchema)

module.exports = Address