const router = require('express').Router()
const commentsController = require('../controllers/commentsController')
const commentsValidation = require('../middlewares/commentsValidation')
const validateToken = require('../middlewares/tokenValidation')

// ROUTES Comments
router.get('/:id?', validateToken.tokenValidate, commentsController.getComments)
router.post(
  '/',
  validateToken.tokenValidate,
  commentsValidation.validateCreate,
  commentsController.createComments
)
router.patch(
  '/update/:id',
  validateToken.tokenValidate,
  commentsController.updateComments
)
router.delete(
  '/delete/:id',
  validateToken.tokenValidate,
  commentsController.deleteComments
)

module.exports = router
