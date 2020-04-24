require('dotenv').config({path: `${__dirname}/../config.env`});
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');

mongoose.connect(process.env.DB_ONLINE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => console.log('DB connected successfully!'));

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const doctors = JSON.parse(fs.readFileSync(`${__dirname}/doctors.json`, 'utf-8'));

const importData = async () => {
    try {
        await User.create(users);
        await Doctor.create(doctors);
        console.log('Data imported');
    } catch (err) {
        console.error(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await User.deleteMany();
        await Doctor.deleteMany();
        console.log('Data deleted');
    } catch (err) {
        console.error(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
