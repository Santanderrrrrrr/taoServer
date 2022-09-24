const mongoose = require('mongoose');
require('dotenv').config();
const URI = process.env.MONGODB_URI

const _connect = async()=>{
    try{
        await mongoose.connect(`${URI}`, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        
    } catch(err){
        console.log(err, err.message)
    }
}
    
_connect()