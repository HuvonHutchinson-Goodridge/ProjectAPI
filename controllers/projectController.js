const AppError = require("./../utils/appError");
const Project = require("./../models/projectModel")
const APIFeatures = require("./../utils/apiFeatures")
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory')

exports.getAllProjects = factory.getAll(Project);
exports.getProject = factory.getOne(Project);
exports.createProject = factory.createOne(Project);
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);

exports.getProjectStats = catchAsync(async (request, response, next) => {
    const stats = await Project.aggregate([
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