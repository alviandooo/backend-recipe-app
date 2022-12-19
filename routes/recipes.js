const router = require('express').Router()
const recipesController = require('../controllers/recipesController')
const recipesValidation = require('../middlewares/recipesValidation')
const validateToken = require('../middlewares/tokenValidation')

router.get('/:id?', validateToken.tokenValidate, recipesController.getRecipes)
router.get(
  '/data/search',
  validateToken.tokenValidate,
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
