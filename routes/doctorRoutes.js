const express = require('express');
const doctorController = require('./../controllers/doctorController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/')
    .get(doctorController.getAllDoctors);

router.route('/:id')
    .get(doctorController.getDoctor)
    .patch(authController.isAuth, authController.restrictTo('admin'), doctorController.updateDoctor)
    .delete(authController.isAuth, authController.restrictTo('admin'), doctorController.deleteDoctor);

module.exports = router;