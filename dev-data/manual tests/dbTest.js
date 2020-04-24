require('dotenv').config({path: './config.env'});
const mongoose = require('mongoose');
const User = require('../../models/userModel');

const isDev = process.env.NODE_ENV === 'development';
const DB = isDev ? process.env.DB_LOCAL : process.env.DB_ONLINE;

const docObject = {
    name: 'Shit',
    email: 'shit@shit.com',
    password: 'test1234',
    passwordConfirm: 'test1234',
    role: 'doctor',
    city: 'Shit',
    doctorDetails: {
        presence_locations: [{at: 'my ass', from: '8:00', to: '2:00'}],
        specialty: ['Cardiologist', 'Cardiologist', 'Cardiologist'],
        clinic: {
            openTimes: [
                {
                    day: 'Sunday', from: '08:00', to: '10:00'
                }
            ]
        },
        phone: 5423655632
    },
}

mongoose.connect(DB,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(async () => {
        console.log("DB connected successfully!");
        const doc = await User.create(docObject);
        console.log(doc);
        process.exit();
    });
