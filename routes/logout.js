const express = require('express');
const router = express.Router()
const jwt =require('jsonwebtoken')
const userModel = require('../models/schemas/User')

const handleLogout = async (req, res) => {
    try{
        //extract the person's details from req
        const {email, password} = req.body
        // On client, also delete the accessToken
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204); //No content
        const cookiesRefreshToken = cookies.jwt;

        // Is refreshToken in any user document in collection?
        const foundUser = await userModel.findOne({refreshToken:cookiesRefreshToken}).exec()
        
        if (!foundUser) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); //
            return res.sendStatus(204); //succesful but there's no content
        }

        // Delete refreshToken in db
        foundUser.refreshToken = '';
        await foundUser.save();

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }); //
        res.sendStatus(204);
    }catch(e){
        console.log(e)
        res.status(401).json({ error: e.message, status: 'signout failed' });
    }
}

router.post('/', handleLogout)

module.exports = router;