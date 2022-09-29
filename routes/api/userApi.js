const express = require('express');
const router = express.Router();
const userControllers = require('../../controllers/userControllers')
const jwt = require('jsonwebtoken');

const jwtForUpdateDelete = (req, res, next)=>{
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            if (req.body.id != decoded.id) return res.sendStatus(403);
            next()
        }
    );
}

router.route('/')
    .get(userControllers.getAllUsers)
    .put(jwtForUpdateDelete, userControllers.updateUser)
    .delete(jwtForUpdateDelete, userControllers.deleteUser);

router.route('/:id')
    .get(userControllers.getUser);

module.exports = router;