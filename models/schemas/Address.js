const mongoose = require('mongoose')
const ObjectID = mongoose.Schema.Types.ObjectId

const address = new mongoose.Schema({
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