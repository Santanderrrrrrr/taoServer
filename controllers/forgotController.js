const jwt = require('jsonwebtoken');
const userModel = require('../models/schemas/User')
const {_changePassword} = require('../utils/nodemailer')
const bcrypt = require('bcrypt')
require('dotenv').config();



//step 1: user sends their email here and an email reset link is sent to them
const forgotRequest = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ 'message': 'Email needed to change password' });
    console.log('step 1!')
    // create user(should check for duplicate usernames in the db) <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    try {
        let filter ={email: email}
        let user = await userModel.findOne(filter)
        if(!user){
            let msg = 'user does not exist. Register.' 
            console.log(e)
            throw new Error(msg)
        }

        const accessToken = jwt.sign(
            {
                "username": user.username,
                "id": user._id.toString()
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
        
        _changePassword(email, accessToken)
        res.status(201).json({ 'message': `Check your mail!` });
    } catch (err) {
        if(err.message== 'user does not exist. Register.') res.status(404).json(err.message) //Not found code
        res.status(500).json({ 'message': err.message });
    }
}

//step 2: user clicks on the email reset link and receives the password reset page with their email and accessToken in return
const resetRequest = async(req, res)=>{
    try{
        console.log('step 2!')
        const { email, theToken } = req.params
        const filter = { email: email}
        const update = { refreshToken: ""}
        console.log(filter, update, theToken)

        let updatedUser = await userModel.findOneAndUpdate(filter, update)
        if(!updatedUser) res.status(404).send('User non-existent')
        console.log(updatedUser)
        // verify access token and create JWTs
        const decoded = jwt.verify(
            theToken,
            process.env.ACCESS_TOKEN_SECRET    
        );

        if(decoded.username !== updatedUser.username) res.status(403).json({"message":"Forbidden activity. You are not the user you're trying to edit."})
                        

        // res.status(200).sendFile(path.join(__dirname,'..','public','views', '/resetPassword.html'));
        res.status(200).render('resetPassword', {helpers:{
            userEmail: function(){ return `${email}`},
            userName: function(){ return `${decoded.username}`},
            userToken: function(){ return `${theToken}`},
            title: function(){ return `Reset Password!`}
        }})

    }catch(err){
        if(err.message === 'jwt expired') res.status(403).json({'message' : `${err.message}, you took too long to hit the link in email. Please try requesting a new password reset link.`})
    }

}

//step 3: user sends their email and new password and their password is set and they receive a success page in return.
const resetPass = async(req, res)=>{
    console.log('step 3!')
    const { email, thatToken, password } = req.body
        
    try{
        let filter = { email: email}

        const toBeReset = await userModel.findOne(filter)
        if(!toBeReset) return res.status(404).json({'error':`there's no user with email ${email} in db`})
        const decoded = jwt.verify( thatToken, process.env.ACCESS_TOKEN_SECRET )
        if(toBeReset.username !== decoded.username) return res.status(403).json({"message":"Forbidden activity. You are not the user you're trying to edit."})

        const refreshToken = jwt.sign(
            { 
                "username": toBeReset.username,
                "id": toBeReset._id.toString()
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        
    // Saving refreshToken with current user
        toBeReset.refreshToken = refreshToken;
        toBeReset.password = password;
        await toBeReset.save();

        return res.status(200).send(`Changes made successfully`)
    }catch(err){
        if(err.message===`Password update for ${email} failed`){
            console.log({message: 'password reset failed at Mongo'})
        }else{
            console.log(err.message)
        }
    }
}



module.exports = { forgotRequest, resetRequest, resetPass }