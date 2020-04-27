const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.getAll = Model => catchAsync(async (req, res) => {
    const query = Model.find();
    const docs = await query;
    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
            docs
        }
    })
});

exports.getOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const query = Model.findById(id);
    const doc = await query;
    if (!doc) return next(new AppError('No document found with that ID!', 404));
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
});


exports.createOne = Model => catchAsync(async (req, res, next) => {
    const body = req.body;
    const query = Model.create(body);
    const doc = await query;
    if (!doc) return next(new AppError('No document found with that ID!', 404));
    res.status(201).json({
        status: 'success',
        data: {
            doc
        }
    })
});


exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const body = req.body;
    const query = Model.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    });
    const doc = await query;
    if (!doc) return next(new AppError('No document found with that ID!', 404));
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
});

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const query = Model.findByIdAndDelete(id);
    const doc = await query;
    if (!doc) return next(new AppError('No document found with that ID!', 404));
    res.status(204).json({
        status: 'success',
        data: null
    })
});

