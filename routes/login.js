require('dotenv').config()
const express = require('express');
const router = express.Router()
const jwt = require('jsonwebtoken');
const userModel = require('../models/schemas/User')



const handleLogin = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ 'message': 'Email and password are required.' });
        //making sure the user is existent <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        const foundUser = await userModel.findByCredentials(email, password)
        if (!foundUser) return res.sendStatus(401); //Unauthorized 

        // create JWTs
            const accessToken = jwt.sign(
                {
                    "username": foundUser.username,
                    "id": foundUser._id.toString()
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            );
            const refreshToken = jwt.sign(
                { 
                    "username": foundUser.username,
                    "id": foundUser._id.toString()
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        await foundUser.save();
        let user = foundUser.toJSON();
                        
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000, secure: true }); 
        res.json({ accessToken, user});
    }catch(e){
        res.status(401).json({ error: e.message, status: 'you hit login but unauthorized' });
    }
    
}

router.post('/', handleLogin)

module.exports = router;