const router = require('express').Router()
const recipesController = require('../controllers/recipesController')
const recipesValidation = require('../middlewares/recipesValidation')
const { useRedis } = require('../middlewares/redis')
const validateToken = require('../middlewares/tokenValidation')

router.get('/:id?', useRedis, recipesController.getRecipes)
router.get(
  '/data/search',
  recipesValidation.validateSearch,
  recipesController.searchRecipes
)
router.post(
  '/',
  validateToken.tokenValidate,
  recipesValidation.validateCreate,
  recipesController.createRecipes
)
router.patch(
  '/update/:id',
  validateToken.tokenValidate,
  recipesValidation.checkUser,
  recipesController.updateRecipes
)
router.delete(
  '/delete/:id',
  validateToken.tokenValidate,
  recipesValidation.checkUser,
  recipesController.deleteRecipes
)

module.exports = router
