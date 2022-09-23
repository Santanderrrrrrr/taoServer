const express = require('express');
const router = express.Router()
const userModel = require('../models/schemas/User')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async (req, res) => {
    try{
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(401);
        const cookiesRefreshToken = cookies.jwt;

        const foundUser = await userModel.findOne({refreshToken: cookiesRefreshToken}).exec();
        if (!foundUser){ 
            console.log(`the error happens here first`)
            console.log(`${foundUser.username}`)
            return res.sendStatus(403);} //Forbidden 
        // evaluate jwt 
        jwt.verify(
            cookiesRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err || foundUser.username !== decoded.username){  
                    console.log(`here's the error`)
                    res.sendStatus(403);
                    return
                }
                const accessToken = jwt.sign(
                    {
                        "username": foundUser.username,
                        "id": foundUser._id.toString()
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '30m' }
                );
                res.json({ accessToken })
            }
        );
    } catch(e){
        console.log(e);
        res.status(401).json({ error: e.message, status: 'refresh failed' });
    }
}

router.get('/', handleRefreshToken)

module.exports = router