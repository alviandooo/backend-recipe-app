const router = require('express').Router()
const commentsController = require('../controllers/commentsController')
const commentsValidation = require('../middlewares/commentsValidation')

// ROUTES Comments
router.get('/:id?', commentsController.getComments)
router.post(
  '/',
  commentsValidation.validateCreate,
  commentsController.createComments
)
router.patch('/update/:id', commentsController.updateComments)
router.delete('/delete/:id', commentsController.deleteComments)

module.exports = router
