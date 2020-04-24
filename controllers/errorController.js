const isDev = process.env.NODE_ENV === 'development';

const sendErrorDev = (err, req, res) => {
    res.status(err.statusCode)
        .json({
            status: err.status,
            message: err.message,
            error: err.error,
            stack: err.stack,
        });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    sendErrorDev(err, req, res);
    // if (isDev) {
    // } else {
    //     // TODO
    // }
};