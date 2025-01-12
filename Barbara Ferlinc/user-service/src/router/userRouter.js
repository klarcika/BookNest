const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.post('/add', userController.addUser);
router.post('/id', userController.findUser);
router.get('/all', userController.allUsers);
router.get('/:id', userController.findEmail);
router.delete('/:id', userController.deleteUser);

module.exports = router;