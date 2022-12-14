const router = require('express').Router()
const registerController = require('../controllers/auth/registerController')
const loginController = require('../controllers/auth/loginController')
const usersValidation = require('../middlewares/usersValidation')
const authValidation = require('../middlewares/authValidation')

router.post(
  '/register',
  usersValidation.validateCreate,
  registerController.register
)
router.post('/login', authValidation.validateLogin, loginController.login)

module.exports = router
