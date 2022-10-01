const productModel = require('../models/schemas/Product')
const categoryModel = require('../models/schemas/Category')


exports.createProduct = async function(req, res){
    const { userID, name, description, price, images, inventory, category } = req.body;
    if (!name || !description || !price || !images ||!inventory || !category) return res.status(400).json({ 'message': 'All fields must be filled!' });
   
    
    // create product(should check for duplicate product in the db) <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    
        try{
            let Category = await categoryModel.findOne({"name": category})
            if(!Category) Category = await categoryModel.create({"name":category})

            const Product = await productModel.create({sellerId : userID , name, description, price, inventory, images, categoryId : Category._id})
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
        return res.status(204).json({ "message": `No Product matches ID ${req.params.id}.` });
    }
    res.json(product);
}
