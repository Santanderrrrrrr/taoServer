const express = require('express')
const router = express.Router()
const userModel = require('../models/schemas/User')
const path = require('path')
require('dotenv').config()


const setVerified = async(req, res)=>{
    try{
        const { email } = req.params
        const filter = { email: email }
        const update = { verified: true }

        let updatedUser = await userModel.findOneAndUpdate(filter, update)
        updatedUser = await userModel.findOne(filter)
        res.status(200).sendFile(path.join(__dirname,'..','public','views', '/verified.html'))
    }catch(err){
        console.log(err.message)
    }
}

router.get('/:email', setVerified)

module.exports = router