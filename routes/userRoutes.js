const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');
const doctorController = require('./../controllers/doctorController');
const fileController = require('./../controllers/fileController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.isLoggedIn, authController.login);
router.get('/logout', authController.logout);

router.use(authController.isAuth);

router.route('/me')
    .get(userController.getMe, userController.getUser)
    .patch(fileController.uploadPhoto('image'), fileController.resizePhoto,
        doctorController.updateMe, userController.updateMe);

router.use(authController.restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;