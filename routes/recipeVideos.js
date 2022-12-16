const router = require('express').Router()
const recipesVideosController = require('../controllers/videosController')
const recipesVideosValidation = require('../middlewares/videosValidation')
const validateToken = require('../middlewares/tokenValidation')

router.get(
  '/:id?',
  validateToken.tokenValidate,
  recipesVideosController.getRecipeVideos
)
router.post(
  '/',
  validateToken.tokenValidate,
  recipesVideosValidation.validateCreate,
  recipesVideosController.createRecipeVideos
)
router.patch(
  '/update/:id',
  validateToken.tokenValidate,
  recipesVideosController.updateRecipeVideos
)
router.delete(
  '/delete/:id?',
  validateToken.tokenValidate,
  recipesVideosController.deleteRecipeVideos
)

module.exports = router
