const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

const storage = multer.memoryStorage();

const fileFilter = (...types) => (req, file, cb) => {
    if (types.includes(file.mimetype.split('/')[0])) return cb(null, true);
    return cb(new AppError('Please only upload images', 400), false);
};

const upload = (...types) => multer({storage, fileFilter: fileFilter(...types)});

exports.uploadPhoto = type => upload(type).single('photo');
exports.resizePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`);
    next();
});
