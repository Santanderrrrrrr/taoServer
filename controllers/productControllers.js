const productModel = require('../models/schemas/Product')
const categoryModel = require('../models/schemas/Category')
const sizeModel = require('../models/schemas/Size')
const UserModel = require('../models/schemas/User')
const genderModel = require('../models/schemas/Gender')
const likeModel = require('../models/schemas/Like')
const brandModel = require('../models/schemas/Brand')


exports.createProduct = async function(req, res){
    let {name, description, price, images, category, size, gender, brand, condition } = req.body;
    if (!req.user || !description || !price || !images ||!condition || !category || !size || !gender || !brand || !name) return res.status(400).json({ 'message': 'All fields must be filled!' });
    name = name.toLowerCase();
    description = description.toLowerCase();
    condition = condition.toLowerCase();
    category = category.toLowerCase();//
    if(brand){
        brand = brand.toLowerCase();
    }
    
    // create product(should check for duplicate product in the db) <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    
    try{
        let Category = await categoryModel.findOne({"name": category})
        if(!Category) Category = await categoryModel.create({"name":category})
        let Size = await sizeModel.findOne({"name": size})
        if(!Size) Size = await sizeModel.create({"name":size})
        let Gender = await genderModel.findOne({"name": gender})
        if(!Gender) Gender = await genderModel.create({"name":gender})
        let daBrand = await brandModel.findOne({"name": brand})
        if(!daBrand) daBrand = await brandModel.create({"name":brand})

        const Product = await productModel.create({sellerId : req.id , name, description, price, images, categoryId : Category._id, sizeId: Size._id, genderId: Gender._id, brandId: daBrand._id, condition: condition})
        res.status(201).send(Product)
        
        Product.categoryId = Category._id
        await Product.save()
        
    } catch(e){
        let msg = e.code==11000? 'product already exists' : e.message  
        console.log(e)
        res.status(409).json(msg) //Conflict code
    }
    

}

exports.getAllProducts = async function(req, res){
    try{
        const products = await productModel.find()
            .sort({ _id: -1 })
            .populate("sellerId", "username")
            .populate("categoryId", "name")
            .populate("sizeId", "name")
            .populate("genderId", "name")
            .populate("brandId", "name")   
            .exec()     
        if (!products) return res.status(400).json({ "message": "No products yet... Add the first one!" });
        res.json(products);
    }catch(error){
        conole.log(error)
        res.status(500).send(error.message)
    }
}

exports.updateProduct = async function(req, res){
    console.log('simple hit')
    try{    
        console.log(req.body)
        const { updates, prodId } = req.body
        // console.log('these are the updates: ',updates)
        // console.log('this is the prodId: ',prodId)

        for(let [update, value ] of Object.entries(updates)){
            let stringValues = ["description", "name", "brand"]
            if(stringValues.indexOf(`${update}`) !== -1 && typeof value === "string") updates[update] = value.toLowerCase();
        }

        console.log(updates)
        
        if(!updates) return res.status(400).json({ "message": "no changes registered"})
        if(updates.category){
            const cat = await categoryModel.findOne({name: updates.category})
            delete updates.category
            updates.categoryId = cat._id
        }
        if(updates.size){
            const cat = await sizeModel.findOne({name: updates.size})
            delete updates.size
            updates.sizeId = cat._id
        }
        if(updates.gender){
            const cat = await genderModel.findOne({name: updates.gender})
            delete updates.gender
            updates.genderId = cat._id
        }
        if(updates.brand){
            let daBrand = await brandModel.findOne({name: updates.brand})
            if(!daBrand) daBrand = await brandModel.create({"name":updates.brand})
            delete updates.brand
            updates.brandId = daBrand._id
        }

        
            
        await productModel.findOneAndUpdate({'_id': prodId }, {'$set':updates}, {new: true})
        .populate("sellerId", "username")
        .populate("categoryId", "name")
        .populate("sizeId", "name")
        .populate("genderId", "name")
        .populate("brandId", "name")
        .exec(function(err, product){
            if (err){
                throw new Error(err.message)
            }else{
                console.log(product)
                res.status(200).json({product})
            }
        });
    }catch(error){
        console.log(error)
        res.status(500).send(error.message)
    }
}

exports.deleteProduct = async function(req, res){
    if (!req?.body?.prodId) return res.status(400).json({ 'message': 'Product ID required.' });
    
    const product = await productModel.findOne({ _id: req.body.prodId })
    .exec();
    if (!product) {
        return res.status(204).json({ "message": `No product matches ID ${req.body.prodId}.` });
    }
    const result = await productModel.deleteOne({ _id: req.body.prodId }); 
    res.json({result, "message":`product ${product.name} of id ${product._id} deleted`});
}

exports.getProduct = async function(req, res){
    if (!req?.params?.prodID) return res.status(400).json({ 'message': 'Product ID required.' });

    const product = await productModel.findOne({ _id: req.params.prodID })
    .populate("sellerId")
    .populate("categoryId", "name")
    .populate("sizeId", "name")
    .populate("genderId", "name")
    .populate("brandId", "name")
    .exec()
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
        .populate("brandId", "name")
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

exports.findProduct = async(req, res)=>{
    const { daiquiri } = req.params
    console.log(daiquiri)
    if (!daiquiri){
        return res.status(304).json({ "message":"search parameter not present"})
    }
    try{
        // const products = await userModel.find({$text: {$search: daiquiri}}).exec()
        const products = await productModel.find({
            "$or": [ 
                { "name" : { $regex: daiquiri }}, 
                { "description" : { $regex: daiquiri }}, 
                // { "brand" : { $regex: daiquiri }}, 
            ]
        });
        // console.log(products)
        if(!products){
            return res.status(204).json({ "message": `No Product matches search parameter ${daiquiri}.` });
        }
        res.status(200).json(products)
    }catch(error){
        console.log(error)
    }
}

exports.populateFeed = async(req, res)=>{
    const user = req.id
    const page = req.query.page || 1
    const skip = (page - 1 )* 10
    console.log("page = ",req.query.page)
    if(!user) throw new Error({"message": "User ID not in request"})
    if(!page) throw new Error({"message": "Page number not in request"})
    try {
        const currentUser = await UserModel.findById(user)
        await productModel.find({ sellerId: { $in: currentUser.following } })
            .populate("sellerId", "username")
            .populate("categoryId", "name")
            .populate("sizeId", "name")
            .populate("genderId", "name")
            .populate("brandId", "name")   
            .skip(skip)
            .limit(10)
            .sort({ createdAt: -1 })
            .exec((err, products) => { //limit(2).
                if (err) {
                    // Handle the error
                    console.error(err);
                    res.status(500).send('Error retrieving home feed');
                } else {
                    // Send the products to the frontend
                    res.status(200).json({ products: products });
                }
            });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: `failed with error: ${error.message}`})
    }
}