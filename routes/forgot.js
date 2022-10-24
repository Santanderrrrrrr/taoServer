const express = require('express')
const router = express.Router()
const { forgotRequest, resetRequest, resetPass } = require('../controllers/forgotController')
const timeout = require('connect-timeout')


router.post('/', forgotRequest)
router.get('/:email/token/:theToken', timeout('80s'), resetRequest)
router.post('/reset', resetPass)

module.exports = router;