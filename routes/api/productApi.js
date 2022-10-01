const express = require('express')
const router = express.Router()
const productController = require('../../controllers/productControllers')
const productModel = require('../../models/schemas/Product')

const verifMid = async (req, res, next)=>{
    const tbu = await productModel.findOne({_id: req.body.updates.prodID})
    if(!tbu) return res.status(400).json({ "message": `no product with id: ${req.body.updates.prodID} in DB`})
    if(!tbu.sellerId === req.id) return res.status(401).json({"message":"you can't edit someone else's products"})
    next()
}

router.route('/')
    .post(productController.createProduct)
    .get(productController.getAllProducts)
    .put(verifMid, productController.updateProduct)
    .delete(verifMid, productController.deleteProduct);
    
router.route('/aspect')
    .get(productController.getFiltered)
router.route('/:prodID')
    .get(productController.getProduct);


module.exports = router