const AppError = require("./../utils/appError");
const User = require("./../models/userModel")
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = Object.create(Object.prototype);
    Object.keys(obj).forEach(element => {
        if (allowedFields.includes(element)) {
            newObj[element] = obj[element]
        }
    })
    return newObj;
}

exports.updateMe = catchAsync(async (request, response, next) => {
    //Create an error if user tries to update the password
    if (request.body.password || request.body.confirmPassword) {
        return next(new AppError('This route is not for password updates. Please use /updatePassword', 400))
    }
    //if not, update the user document
    //Filter out unwanted field names
    const filteredBody = filterObj(request.body, "firstName", "lastName", "email");
    const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, {
        new: true, runValidators: true
    });
    response.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }

    })
})

exports.getMe = (request, response, next) => {
    request.params.id = request.user.id
    next();
}

exports.deleteMe = catchAsync(async (request, response, next) => {
    await User.findByIdAndUpdate(request.user.id, { active: false });
    response.status(204).json({
        status: 'success',
        data: null
    })
})

//DO NOT UPDATE PASSWORDS WITH THIS
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
