const router = require('express').Router()
const recipesVideosController = require('../controllers/videosController')
const recipesVideosValidation = require('../middlewares/videosValidation')

router.get('/:id?', recipesVideosController.getRecipeVideos)
router.post(
  '/',
  recipesVideosValidation.validateCreate,
  recipesVideosController.createRecipeVideos
)
router.patch('/update/:id', recipesVideosController.updateRecipeVideos)
router.delete('/delete/:id?', recipesVideosController.deleteRecipeVideos)

module.exports = router
