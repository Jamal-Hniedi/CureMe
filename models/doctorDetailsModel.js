const mongoose = require('mongoose');
const validator = require('validator').default;

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name']
    },
    email: {
        type: String,
        required: [true, 'User must have an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
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
    }
});


const Doctor = mongoose.model('Doctor', schema);
module.exports = Doctor;
