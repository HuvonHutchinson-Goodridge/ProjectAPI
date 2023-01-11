const AppError = require('./../utils/appError')
const sendErrorDev = (err, response) => {
    response.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, response) => {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
        response.status(err.statusCode).json({
            status: err.status,
            message: err.words
        })
    } else {
        //Log Error
        console.error('ERROR', err);

        //Send the generic error messagenn
        response.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
}

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.keyValue.bug
    const message = `Duplicate field value: ${value} Please use another value`
    return new AppError(message, 400)
}

const handleValidationErrorDB = () => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')} `
    return new AppError(message, 400);
}

const handleJWTError = () => {
    return new AppError('Invalid Token. Please log in again! ', 401);
}

const handleJWTExpiredError = err => new AppError('Your token has expired! Please log in again.', 404)

module.exports = (err, request, response, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, response);
    } else if (process.env.NODE_ENV === 'production') {
      
        let error = { ...err }
       
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError") error = handleValidationErrorDB(error)
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()
        sendErrorProd(error, response);
    }   
}