const router = require('express').Router()
const userController = require('../controllers/usersController')

// ROUTES USER
router.get('/:id?', userController.getUsers)
router.patch('/edit/:id', userController.editUsers)
router.delete('/delete/:id', userController.deleteUsers)

module.exports = router
