const AppError = require('./../utils/AppError');
const Doctor = require('./../models/doctorModel');
const factory = require('./factory');
const catchAsync = require('../utils/catchAsync');
const filterObject = require('./../utils/filterObject');

exports.getAllDoctors = factory.getAll(Doctor);
exports.getDoctor = factory.getOne(Doctor);
exports.updateDoctor = factory.updateOne(Doctor);
exports.deleteDoctor = factory.deleteOne(Doctor);

exports.updateMe = catchAsync(async (req, res, next) => {
    console.log(req.user);
    if (req.user.role !== 'doctor') return next();
    const filteredBody = filterObject(req.body, null, ['user', 'fee', 'verified']);
    const user = await Doctor.findOneAndUpdate({user: req.user._id}, filteredBody, {
        new: true,
        runValidators: true
    });
    if (!user) return next(new AppError('No User found with that ID!', 404));
    next();
});