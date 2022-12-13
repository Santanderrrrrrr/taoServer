const userModel = require('../models/schemas/User')





const getAllUsers = async(req, res)=>{
    try {
        
        const users = await userModel.find();
        if (!users) return res.status(204).json({ "message": "Nobody else is here! You're first!" });
        res.json(users);
    } catch (error) {
        console.log(error)
        res.status(500).json({message: `failed with error ${e.message}`})
    }
}

const updateUser = async(req, res)=>{
    try {
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
    } catch (error) {
        console.log(error)
        res.status(500).json({message: `failed with error ${e.message}`})
    }
}

    const deleteUser = async(req, res)=>{
        
    try{    
        if (!req?.body?.id) return res.status(400).json({ 'message': 'User ID required.' });
        
        const user = await userModel.findOne({ _id: req.body.id })
        .exec();
        if (!user) {
            return res.status(204).json({ "message": `No User matches ID ${req.body.id}.` });
        }
        const result = await userModel.deleteOne({ _id: req.body.id }); 
        res.json({result, "message":`User ${user.username} of id ${req.body.id} deleted`});
    }catch(error){
        consle.log(error)
        res.status(500).json({message: `failed with error ${e.message}`})
    }
}

const getUser = async (req, res) => {
    try {
        
        if (!req?.params?.id) return res.status(400).json({ 'message': 'User ID required.' });
    
        const user = await userModel.findOne({ _id: req.params.id }).exec();
        if (!user) {
            return res.status(204).json({ "message": `No User matches ID ${req.params.id}.` });
        }
        res.json({user});
    } catch (error) {
        res.status(500).json({message: `failed with error ${e.message}`})
    }
}

const findUser = async(req, res)=>{
    const { daiquiri } = req.params
    console.log(daiquiri)
    if (!daiquiri){
        return res.status(304).json({ "message":"search parameter not present"})
    }
    try{
        const users = await userModel.find({
            "$or": [ 
                { "firstname" : { $regex: daiquiri }}, 
                { "lastname" : { $regex: daiquiri }}, 
                { "username" : { $regex: daiquiri }}, 
                { "email" : { $regex: daiquiri }}
            ]
        });
        if(!users){
            return res.status(204).json({ "message": `No User matches search parameter ${daiquiri}.` });
        }
        res.status(200).json(users)
    }catch(error){
        console.log(error)
        res.status(500).json({message: `failed with error ${e.message}`})
    }
}

const follow=async(req, res)=>{
    try{
        const { userId } = req.params
        const user = req.id
        //ensure product id and user id are present
        if(!userId){
            return res.status(404).json({ message: "no such user exists yet. How'd you even find them? :)"})
        }
        if(!user){
            return res.status(401).json({ message: "you have to be logged in to follow someone :)"})
        }

        //finding the user from DB
        let userToFollow = await userModel.findOne({_id: userId})
        if(!userToFollow){
            return res.status(500).json({ message: "no such user was found in db :)"})
        }

        let follower = await userModel.findOne({_id: user})
        // console.log(follower)
        //logic to check if user is already following userId
        let followerNotFollowing = follower.following.indexOf(userToFollow._id) === -1
        if(followerNotFollowing){
            follower.following = [...follower.following, userToFollow._id]
            await follower.save()
        }else{
            follower = await userModel.findOneAndUpdate({_id: user}, {$pull:{following: userId}}, {new: true})

        }
        // console.log(follower.following)
        let userToFollowFollowed = userToFollow.followers.indexOf(follower._id) !== -1

        // logic to add user to liked list
        if(!userToFollowFollowed){
            userToFollow.followers = [... userToFollow.followers, follower._id]
            await userToFollow.save()
        }else{
            userToFollow = await userModel.findOneAndUpdate({_id: userId}, {$pull:{followers: user}}, {new: true})
        }

        res.status(200).json({message: "follow action complete", follower: follower, followed: userToFollow})
    }catch(e){
        console.log(e)
        res.status(500).json({message: `failed with error ${e.message}`})
    }
}



module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
    getUser,
    findUser,
    follow
}