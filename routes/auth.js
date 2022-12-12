const router = require('express').Router()
const authController = require('../controllers/authController')
const usersValidation = require('../middlewares/usersValidation')
const authValidation = require('../middlewares/authValidation')

router.post(
  '/register',
  usersValidation.validateCreate,
  authController.register
)
router.post('/login', authValidation.validateLogin, authController.login)

module.exports = router
