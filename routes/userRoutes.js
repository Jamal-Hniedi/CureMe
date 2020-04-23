const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.isLoggedIn, authController.login);
router.get('/logout', authController.logout);
router.get('/get-access-token', authController.isLoggedIn, authController.getAccessToken);

router.use(authController.isAuth);


router.get('/:id/adminize', authController.restrictTo('admin'), userController.adminize);

router.route('/')
    .get(userController.getAllUsers);

module.exports = router;