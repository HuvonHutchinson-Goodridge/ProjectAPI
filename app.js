const express = require('express');
const morgan = require('morgan');
const app = express();
const AppError = require('./utils/appError')
const bugRouter = require('./routes/bugRoutes')
const userRouter = require('./routes/userRoutes')
const projectRouter = require('./routes/projectRoutes')
const globalErrorHandler = require('./controllers/errorController')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

//Global Middleware
//Security Http headers
app.use('/api', helmet());

//Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


//Limit request from the same API
const limiter = rateLimit({
    max: 100,
    windowMs: 3600000,
    message: 'Too many request from this IP, please try again in an hour!'
})

app.use('/api', limiter);

//Body parser, reading data from body into request.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//Data sanitization against noSQL query injection and XSS
app.use(mongoSanitize());
app.use(xss());

//Prevent Parameter pollution
app.use(hpp({
    whitelist: ['assignedTo', 'numOfPeople', 'createdAt']
}));

app.use((request, response, next) => {
    request.requestTime = new Date().toISOString();
    console.log(request.cookies);
    next();
})


//Routes
app.use('/api/v1/bugs', bugRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/projects', projectRouter);
app.all('*', function (request, response, next) {
    next(new AppError(`Cant find ${request.originalUrl}`, 404));
})

app.use(globalErrorHandler)
module.exports = app;