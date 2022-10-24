const express = require('express')
const router = express.Router()
const { forgotRequest, resetRequest, resetPass } = require('../controllers/forgotController')


router.post('/', forgotRequest)
router.get('/:email/token/:theToken', resetRequest)
router.post('/reset', resetPass)

module.exports = router;