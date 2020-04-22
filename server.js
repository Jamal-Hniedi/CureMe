require('dotenv').config({path: './config.env'});
const mongoose = require('mongoose');
const app = require('./app');

const isDev = process.env.NODE_ENV === 'development';
const DB = isDev ? process.env.DB_LOCAL : process.env.DB_ONLINE;

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