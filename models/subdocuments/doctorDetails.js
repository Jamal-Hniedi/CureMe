const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    specialty: {
        type: [String],
        required: [true, 'Please provide at least one specialty'],
        default: undefined
    },
    certificates: {
        _id: false,
        type: [
            {
                title: {
                    type: String,
                    required: [true, 'Certificate must have a title'],
                },
                photo: String,
                link: String
            }
        ]
    },
    presence_locations: {
        _id: false,
        type: [
            {at: String, from: String, to: String,}
        ],
        default: undefined
    },
    clinic: {
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        openTimes: {
            _id: false,
            type: [
                {day: String, from: String, to: String}
            ],
            required: [true, 'Please provide open days and hours for the clinic'],
            default: undefined
        },
        phone: Number
    },
    phone: Number,
    fee: {
        type: Number,
        default: 5000
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {_id: false});

module.exports = schema;
