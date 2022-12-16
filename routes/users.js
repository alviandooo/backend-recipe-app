const router = require('express').Router()
const userController = require('../controllers/usersController')
const validateToken = require('../middlewares/tokenValidation')

// ROUTES USER
router.get('/:id?', validateToken.tokenValidate, userController.getUsers)
router.patch('/edit/:id', validateToken.tokenValidate, userController.editUsers)
router.delete(
  '/delete/:id',
  validateToken.tokenValidate,
  userController.deleteUsers
)

module.exports = router
