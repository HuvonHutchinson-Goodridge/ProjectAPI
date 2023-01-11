const AppError = require("./../utils/appError");
const Bug = require("./../models/bugModel")
const APIFeatures = require("./../utils/apiFeatures")
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')

exports.aliasBestBugs = (request, response, next) => {
    request.query.limit = '5';
    request.query.sort = "numOfPeople";
    request.query.fields = 'user,numOfPeople,bug'
    next();
}

exports.setProjectUserIds = (request, response, next) => {
    //Allows for nested routes
    if (!request.body.user) request.body.user = request.user.id;
    if (!request.body.project) request.body.project = request.params.projectId
    next();
}

exports.getAllBugs = factory.getAll(Bug);
exports.getBug = factory.getOne(Bug);
exports.createBug = factory.createOne(Bug);
exports.updateBug = factory.updateOne(Bug);
exports.deleteBug = factory.deleteOne(Bug);

exports.getBugStats = catchAsync(async (request, response, next) => {
    const stats = await Bug.aggregate([
        {
            $match: {
                numOfPeople: { $gte: 10 }
            }
        },
        {
            $group: {
                _id: { $toUpper: "$bugStatus" },
                avgNumOfPeople: { $avg: '$numOfPeople' },
                numOfBugs: { $sum: 1 },
                numOfPending: { $sum: 1 },
                minPeople: { $min: "$numOfPeople" },
                maxPeople: { $max: "numOfPeople" }
            }
        },
        {
            $sort: {
                numOfPeople: 1
            }
        },
        {
            $match: { _id: { $ne: "Pending" } }
        }
    ])
    response.status(200).json({
        status: 'success',
        stats
    })

})