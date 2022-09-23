const mongoose = require('mongoose');
require('dotenv').config();
const PORT = process.env.MONGODB_PORT

const _connect = async()=>{
    try{
        await mongoose.connect(`mongodb://127.0.0.1:${PORT}/byj`, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        
    } catch(err){
        console.log(err, err.message)
    }
}
    
_connect()