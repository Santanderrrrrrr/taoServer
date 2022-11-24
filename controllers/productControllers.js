const productModel = require('../models/schemas/Product')
const categoryModel = require('../models/schemas/Category')
const sizeModel = require('../models/schemas/Size')
const UserModel = require('../models/schemas/User')
const genderModel = require('../models/schemas/Gender')
const likeModel = require('../models/schemas/Like')


exports.createProduct = async function(req, res){
    const {name, description, price, images, inventory, category, size, gender } = req.body;
    if (!req.user || !description || !price || !images ||!inventory || !category || !size || !gender) return res.status(400).json({ 'message': 'All fields must be filled!' });
   
    
    // create product(should check for duplicate product in the db) <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    
    try{
        let Category = await categoryModel.findOne({"name": category})
        if(!Category) Category = await categoryModel.create({"name":category})
        let Size = await sizeModel.findOne({"name": size})
        if(!Size) Size = await sizeModel.create({"name":size})
        let Gender = await genderModel.findOne({"name": gender})
        if(!Gender) Gender = await genderModel.create({"name":gender})

        const Product = await productModel.create({sellerId : req.id , name, description, price, inventory, images, categoryId : Category._id, sizeId: Size._id, genderId: Gender._id})
        res.status(201).send(Product)
        
        Product.categoryID = Category._id
        await Product.save()
        
    } catch(e){
        let msg = e.code==11000? 'product already exists' : e.message  
        console.log(e)
        res.status(409).json(msg) //Conflict code
    }
    

}

exports.getAllProducts = async function(req, res){
    const products = await productModel.find();
    if (!products) return res.status(400).json({ "message": "No products yet... Add the first one!" });
    res.json(products);
}

exports.updateProduct = async function(req, res){
    
    const { prodname, description, price } = req.body.updates
    console.log('this is the req id: ', req.id)
    let updates = {}
    updates = {...updates, name : prodname, description, price}
    
    if(!updates) return res.status(400).json({ "message": "no changes registered"})

    
        
    await productModel.findOneAndUpdate({'_id': req.body.updates.prodID}, {'$set':updates}, {new: true})
    .exec(function(err, product){
        if (err){
            console.log(err.message)
            res.status(500).send(err.message)
        }else{
            res.send(product)
        }
    });
}

exports.deleteProduct = async function(req, res){
    if (!req?.body?.updates?.prodID) return res.status(400).json({ 'message': 'Product ID required.' });
    console.log('simple hit')
    
    const product = await productModel.findOne({ _id: req.body.updates.prodID })
    .exec();
    if (!product) {
        return res.status(204).json({ "message": `No product matches ID ${req.body.updates.prodID}.` });
    }
    const result = await productModel.deleteOne({ _id: req.body.updates.prodID }); 
    res.json({result, "message":`product ${product.name} of id ${product._id} deleted`});
}

exports.getProduct = async function(req, res){
    if (!req?.params?.prodID) return res.status(400).json({ 'message': 'Product ID required.' });

    const product = await productModel.findOne({ _id: req.params.prodID }).exec();
    if (!product) {
        console.log('so there are no products yet')
        return res.status(204).json({ "message": `No Product matches ID ${req.params.id}.` });
    }
    res.json(product);
}

exports.getFiltered = async function(req, res){
    var filter = req.query
    console.log(filter)
    const result = await productModel.find(filter)  
    
    if(!result || result === null) return res.status(400).send({ "message":"No such product found"})
    return res.status(200).send(result)
    
    
}

exports.getUserProds = async(req, res)=>{
    const userId = req.params.userId
    if(!userId){
        return res.status(404).send({ "message": "User not found"})
    }
    const products = await productModel.find({sellerId: userId})
        .sort({ _id: -1 })
        .populate("sellerId", "username")
        .populate("categoryId", "name")
        .populate("sizeId", "name")
        .populate("genderId", "name")
        .exec()
    if(!products){
        return res.status(404).send({ "message": "User has no products just yet. :)"})
    }
    // const productGender = await genderModel.findOne({_id:})
    const prodArray = []

    for (let i = 0; i<products.length; i++) {
        let product = products[i]
        let prodSeller = UserModel.findOne({_id: products[i].sellerId})
        // product.sellerId = prodSeller.username
        prodArray.push(product)
    }
    return res.status(200).json(products)
}

exports.likeProduct=async(req, res)=>{
    try{
        const { prodId } = req.body
        const user = req.id
        //ensure product id and user id are present
        if(!prodId){
            return res.status(404).json({ message: "no such product exists yet :)"})
        }
        if(!user){
            return res.status(401).json({ message: "you have to be logged in to like :)"})
        }

        //finding the product from DB
        let prodToLike = await productModel.findOne({_id: prodId})
        if(!prodToLike){
            return res.status(500).json({ message: "no such product was found in db :)"})
        }

        let theLike = await likeModel.findOne({user, product: prodToLike._id})
        console.log(theLike)
        //logic to check if product is already liked
        if(!theLike){
            theLike = await likeModel.create({user, product: prodToLike._id})
        }
        console.log(theLike)
        let productLiked = prodToLike.likes.indexOf(theLike.user) !== -1

        // logic to add user to liked list
        if(productLiked){
            return res.status(401).json({message: "You already liked this."}) 
        }   
        prodToLike = await productModel.findOneAndUpdate(
            {_id: prodId},
            {$push:{likes: theLike.user}},
            {new:true}
        ).populate("sellerId", "username")
        .populate("categoryId", "name")
        .populate("sizeId", "name")
        .populate("genderId", "name")        

        res.status(200).json({message: "like", product: prodToLike})
    }catch(e){
        console.log(e)
        res.status(500).json({message: `failed with error ${e.message}`})
    }
    
}
exports.unlikeProduct=async(req, res)=>{
    try{
        const { prodId } = req.body
        const user = req.id
        //ensure product id and user id are present
        if(!prodId){
            return res.status(404).json({ message: "no such product exists yet :)"})
        }
        if(!user){
            return res.status(401).json({ message: "you have to be logged in to unlike :)"})
        }

        //finding the product from DB
        let prodToUnlike = await productModel.findOne({_id: prodId})
        if(!prodToUnlike){
            return res.status(500).json({ message: "no such product was found in db :)"})
        }

        // logic to remove user from liked list
        prodToUnlike = await productModel.findOneAndUpdate(
            {_id: prodId},
            {$pull:{likes: user}},
            {new:true}
        ).populate("sellerId", "username")
        .populate("categoryId", "name")
        .populate("sizeId", "name")
        .populate("genderId", "name")

        let stillLiked = prodToUnlike.likes.includes(user)
        let userIndex = prodToUnlike.likes.indexOf(user)
        if(stillLiked){
            prodToUnlike.likes.splice(userIndex, 1, "")
        }
        res.status(200).json({message: "unlike", product: prodToUnlike})                       
    }catch(e){
        console.log(e)
        res.status(500).json({message: `failed with error ${e.message}`})
    }
    
}