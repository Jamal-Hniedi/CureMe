const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
const filterObject = require('./../utils/filterObject');
const User = require('./../models/userModel');
const factory = require('./factory');

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return next(new AppError('This route is not for password updates. ' +
            'Please use /updatePassword'), 400);
    const filteredBody = filterObject(req.body, ['name', 'email']);
    if (req.file) filteredBody.photo = req.file.filename;
    const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true
    });
    if (!user) return next(new AppError('No User found with that ID!', 404));
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
});
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {active: false});
    res.status(204)
        .json({
            status: 'success',
        });
});