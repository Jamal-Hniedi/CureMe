const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const factory = require('./factory');

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.adminize = catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, {role: 'admin'})
    res.status(200)
        .json({
            status: 'success'
        })
});