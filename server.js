//getting environment variables
require("dotenv").config();
const LISTEN_PORT = process.env.PORT || 3005

//importing middleware
const { logger, errorHandler } = require('./utils/middleware/logEvents')
const cors = require('cors')
const { corsOptions, credentials} = require('./utils/middleware/corsConfig')
const cookieParser = require('cookie-parser')
const verifyJWT = require('./utils/middleware/verifyJWT')
const { engine } = require('express-handlebars')
const path = require('path')


//importing express and db and creating server instance
const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('./models/connection')


//setting handlebars as the viewengine
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', `${path.join(__dirname, 'public', '/views')}`)


//for the credentials to be set
app.use(credentials)

//middleware created for logging all requests
app.use(logger)

//for the cookies to be handled
//middleware for cookies
app.use(cookieParser())

//middleware for parsing urlencoded data in get requests
app.use(express.urlencoded({extended: true}))

//middleware for reading out json
app.use(express.json())

//middleware for cross origin resource sharing
app.use(cors(corsOptions))



//initial routes
app.get('/', (req, res)=>{
    res.status(200).send(`Request received, we're live`)
    // res.status(200).render('resetPassword', {helpers:{
    //     foo: function(){ return 'foo'},
    //     bar: function(){ return 'bar'}
    // }})
})
app.use('/signup', require('./routes/singup'))
app.use('/login', require('./routes/login'))
app.use('/refresh', require('./routes/refresh'))
app.use('/logout', require('./routes/logout'))
app.use('/forgot', require('./routes/forgot'))
app.use('/verify', require('./routes/verifyEmail'))



//api routes
//authorization first
app.use(verifyJWT)

//actual api routes
app.use('/users', require('./routes/api/userApi'));
app.use('/products', require('./routes/api/productApi'))









//errror handler
app.use(errorHandler)

mongoose.connection.once('open', ()=>{
    console.log('MongoDB connection established')
    app.listen(LISTEN_PORT, (err) => {
        if(err) console.log(err.message)
        console.log(`server listening on port ${LISTEN_PORT}`)
    })
})

