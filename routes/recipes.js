const router = require('express').Router()
const recipesController = require('../controllers/recipesController')
const recipesValidation = require('../middlewares/recipesValidation')

router.get('/:id?', recipesController.getRecipes)
router.get(
  '/data/search',
  recipesValidation.validateSearch,
  recipesController.searchRecipes
)
router.post(
  '/',
  recipesValidation.validateCreate,
  recipesController.createRecipes
)
router.patch('/update/:id', recipesController.updateRecipes)
router.delete('/delete/:id', recipesController.deleteRecipes)

module.exports = router
