const router = require('express').Router()
const userController = require('../controllers/usersController')
const { useRedis } = require('../middlewares/redis')
const validateToken = require('../middlewares/tokenValidation')
const userValidation = require('../middlewares/usersValidation')

// ROUTES USER
router.get(
  '/:id?',
  validateToken.tokenValidate,
  useRedis,
  userController.getUsers
)

router.patch(
  '/edit/:id',
  validateToken.tokenValidate,
  userValidation.validateUpdate,
  userValidation.checkUser,
  userController.editUsers
)

router.delete(
  '/delete/:id',
  validateToken.tokenValidate,
  userValidation.checkUser,
  userController.deleteUsers
)

module.exports = router
