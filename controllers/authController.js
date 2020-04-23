const {promisify} = require('util');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const Doctor = require('./../models/doctorModel');
const AppError = require('./../utils/AppError');
const jwt = require('jsonwebtoken');

const JWAT_SK = process.env.JWAT_SK;
const JWAT_EXPIRES_IN = process.env.JWAT_EXPIRES_IN;

const JWRT_SK = process.env.JWRT_SK;
const JWRT_EXPIRES_IN = process.env.JWRT_EXPIRES_IN;

exports.isAuth = catchAsync(async (req, res, next) => {
    const aToken = req.cookies.aToken;
    const rToken = req.cookies.rToken;
    if (!aToken || !rToken) return next(new AppError('Please log in to get access!', 401));
    const decoded = await verifyToken(aToken, 'A');
    if (!decoded) return next(new AppError('Invalid token. Please log in to get access!', 403));
    const user = await User.findOne({_id: decoded.id, rTokens: rToken});
    if (!user) return next(new AppError('Please log in again!', 401));
    if (user.hasPasswordChangedAfter(decoded.iat)) return next(new AppError('Password has been changed recently! Please log in again!', 401));
    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        console.log(userRole);
        if (!roles.includes(userRole)) return next(new AppError('You don\'t have permission to perform this action!', 403));
        next();
    };
};

exports.signup = catchAsync(async (req, res) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        city: req.body.city,
        role: req.body.role !== 'admin' ? req.body.role : undefined,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    let finalUser;
    if (req.body.role === 'doctor') {
        const doc = await Doctor.create({
            user: user._id,
            specialty: req.body.specialty,
            certificates: req.body.certificates,
            presenceLocations: req.body.presenceLocations,
            clinic: req.body.clinic,
            phone: req.body.phone
        });
        finalUser = {
            name: user.name,
            email: user.email,
            city: user.city,
            ...doc.toJSON(),
        };
        await updateUserRefreshTokens(req, res, user);
    } else finalUser = await updateUserRefreshTokens(req, res, user);
    res.status(200).json({
        status: 'success',
        data: {
            user: finalUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) return next(new AppError('Please provide email and password!', 400));
    const user = await User.findOne({email}).select('+password +rTokens');
    if (!user || !await user.isPasswordCorrect(password, user.password))
        return next(new AppError('Incorrect email or password!', 401));
    const updatedUser = await updateUserRefreshTokens(req, res, user);
    res.status(200).json({
        status: 'success',
    });
});

exports.logout = catchAsync(async (req, res) => {
    const rToken = req.cookies.rToken;
    const decoded = await verifyToken(rToken, 'R');
    if (decoded)
        await User.findByIdAndUpdate(decoded.id, {$pull: {rTokens: rToken}}).select('+rTokens');
    res.cookie('aToken', 'logout', {expires: new Date(Date.now())});
    res.cookie('rToken', 'logout', {expires: new Date(Date.now())});
    res.status(204).json({
        status: 'success'
    });
});

exports.getAccessToken = catchAsync(async (req, res, next) => {
    const rToken = req.cookies.rToken;
    if (!rToken) return next(new AppError('Cannot provide access token without refresh token', 400))
    const decoded = await verifyToken(rToken, 'R');
    const updatedRToken = generateToken({id: decoded.id}, 'R');
    const filter = {_id: decoded.id, rTokens: rToken};
    const update = {$set: {'rTokens.$': updatedRToken}};
    const user = await User.findOneAndUpdate(filter, update);
    if (!user) return next(new AppError('The user belonging to this token doesn\'t exist any more!', 401));
    const aToken = generateToken({id: decoded.id}, 'A');
    const aTokenCookieOptions = generateCookieOptions(req, 'A');
    const rTokenCookieOptions = generateCookieOptions(req, 'R');
    res.cookie('aToken', aToken, aTokenCookieOptions);
    res.cookie('rToken', updatedRToken, rTokenCookieOptions);
    res.status(200)
        .json({
            status: 'success'
        });
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    const aToken = req.cookies.aToken;
    const rToken = req.cookies.rToken;
    const aDecoded = await verifyToken(aToken, 'A');
    const rDecoded = await verifyToken(rToken, 'R');
    if (aToken && rToken && aDecoded && rDecoded && await User.findById(aDecoded.id))
        return next(new AppError('You are already logged in!', 400));
    next();
});

const updateUserRefreshTokens = async (req, res, user) => {
    const rToken = req.cookies.rToken;
    const updatedRToken = await buildTokens(req, res, user);
    let updatedUser;
    if (rToken) {
        const filter = {_id: user._id, rTokens: rToken};
        const update = {$set: {'rTokens.$': updatedRToken}};
        updatedUser = await User.findOneAndUpdate(filter, update);
    }
    if (!updatedUser) updatedUser = await User.findByIdAndUpdate(user._id, {$push: {rTokens: updatedRToken}}).select('+rTokens');
    updatedUser.password = undefined;
    updatedUser.active = undefined;
    updatedUser.rTokens = undefined;
    return updatedUser;
};

const buildTokens = async (req, res, user) => {
    const aToken = generateToken({id: user._id, name: user.name}, 'A');
    const rToken = generateToken({id: user._id}, 'R');
    const aTokenCookieOptions = generateCookieOptions(req, 'A');
    const rTokenCookieOptions = generateCookieOptions(req, 'R');
    res.cookie('aToken', aToken, aTokenCookieOptions);
    res.cookie('rToken', rToken, rTokenCookieOptions);
    return rToken;
};

const generateCookieOptions = (req, type) => {
    const options = {
        httpOnly: true,
        secure: req.secure || req.get('x-forwarded-proto') === 'https'
    };
    options.expires = type === 'A' ?
        new Date(Date.now() + JWAT_EXPIRES_IN * 60 * 1000) :
        new Date(Date.now() + JWRT_EXPIRES_IN * 24 * 60 * 60 * 1000);
    return options;
};

const generateToken = (payload, type) => {
    return jwt.sign(payload,
        type === 'A' ? JWAT_SK : JWRT_SK,
        {expiresIn: type === 'A' ? `${JWAT_EXPIRES_IN}m` : `${JWRT_EXPIRES_IN}d`}
    );
};

const verifyToken = async (token, type) => {
    console.log(token);
    try {
        return await promisify(jwt.verify)(token, type === 'A' ? JWAT_SK : JWRT_SK);
    } catch (e) {
        console.error(e);
        return undefined;
    }
};
