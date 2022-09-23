//getting environment variables
require("dotenv").config();
const PORT = process.env.PORT || 3005

//importing middleware
const { logger, errorHandler } = require('./utils/middleware/logEvents')
const cors = require('cors')
const { corsOptions, credentials} = require('./utils/middleware/corsConfig')
const cookieParser = require('cookie-parser')
const verifyJWT = require('./utils/middleware/verifyJWT')

//importing server and db
const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('./models/connection')


//for the credentials to be set
app.use(credentials)

//middleware created for logging all requests
app.use(logger)

//for the cookies to be handles
//middleware for cookies
app.use(cookieParser())

//middleware for urlencoded
app.use(express.urlencoded({extended: true}))

//middleware for reading out json
app.use(express.json())

//middleware for cross origin resource sharing
app.use(cors(corsOptions))



//initial routes
app.get('/', (req, res)=>{
    res.status(200).send(`Request received, we're live`)
})
app.use('/signup', require('./routes/singup'))
app.use('/login', require('./routes/login'))
app.use('/refresh', require('./routes/refresh'))
app.use('/logout', require('./routes/logout'))


//api routes
app.use(verifyJWT)






//errror handler
app.use(errorHandler)

mongoose.connection.once('open', ()=>{
    console.log('MongoDB connection established')
    app.listen(PORT, (err) => {
        if(err) console.log(err.message)
        console.log(`server listening on port ${PORT}`)
    })
})

