require('dotenv').config({path: './config.env'});
const mongoose = require('mongoose');
const app = require('./app');

const isOnline = process.env.IS_ONLINE === 'true';
const DB = isOnline ? process.env.DB_ONLINE : process.env.DB_LOCAL;

process.on('uncaughtException', reason => {
    console.error(reason.name, reason.message);
    process.exit(1);
});

mongoose.connect(DB,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log("DB connected successfully!");
    });

const server = app.listen(process.env.PORT);

process.on('unhandledRejection', reason => {
    console.error(reason);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully!');
    server.close(() => {
        console.log('Process terminated!');
    });
});