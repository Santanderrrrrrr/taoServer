const userModel = require('../models/schemas/User')





const getAllUsers = async(req, res)=>{
    const users = await userModel.find();
    if (!users) return res.status(204).json({ "message": "Nobody else is here! You're first!" });
    res.json(users);
}

const updateUser = async(req, res)=>{
    if (!req?.body?.id) {
        return res.status(400).json({ 'message': 'ID parameter is required.' });
    }
    const switchC = req.body.switchCreds
    delete switchC.password
   
    await userModel.findOneAndUpdate({ "_id": req.body.id }, {"$set": switchC}, {new: true}).exec(function(err, user){
        if (err){
            console.log(err.message)
            res.status(500).send(err.message)
        }else{
            res.send(user)
        }
    }); 
}

const deleteUser = async(req, res)=>{
    
    
    if (!req?.body?.id) return res.status(400).json({ 'message': 'User ID required.' });
    
    const user = await userModel.findOne({ _id: req.body.id })
    .exec();
    if (!user) {
        return res.status(204).json({ "message": `No User matches ID ${req.body.id}.` });
    }
    const result = await userModel.deleteOne({ _id: req.body.id }); 
    res.json({result, "message":`User ${user.username} of id ${req.body.id} deleted`});
}

const getUser = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ 'message': 'User ID required.' });

    const user = await userModel.findOne({ _id: req.params.id }).exec();
    if (!user) {
        return res.status(204).json({ "message": `No User matches ID ${req.params.id}.` });
    }
    res.json(user);
}

module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
    getUser
}