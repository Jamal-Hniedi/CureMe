const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');
const validator = require('validator').default;
const slugify = require('slugify');
const doctorDetails = require('./doctorModel');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name'],
        unique: true,
        trim: true
    },
    photo: String,
    email: {
        type: String,
        required: [true, 'User must have an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'doctor'],
        default: 'user'
    },
    city: {
        type: String,
        required: [true, 'User must belong to a city'],
    },
    password: {
        type: String,
        required: [true, 'User must have a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'User must have a passwordConfirm'],
        validate: {
            // Only works on create() and save()
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    rTokens: {
        type: [String],
        select: false
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    slug: {
        type: String,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

schema.index({slug: 1});

schema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});

schema.pre('save', async function (next) {
    // Only run if password is modified
    if (this.isModified('password')) {
        this.password = await bycrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    }
    next();
});

schema.pre(/^find/, function (next) {
    this.find({active: true});
    next();
});

schema.methods.isPasswordCorrect = async (candidatePassword, userPassword) => {
    return await bycrypt.compare(candidatePassword, userPassword);
};

schema.methods.checkRefreshTokensCount = function () {
    return this.rTokens.length <= 4;
};

schema.methods.hasPasswordChangedAfter = function (JWTDate) {
    if (!this.passwordChangedAt) return false;
    const changedDate = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return changedDate > JWTDate;
};

schema.methods.deleteRefreshToken = function () {
// TODO

};


const User = mongoose.model('User', schema);
module.exports = User;
