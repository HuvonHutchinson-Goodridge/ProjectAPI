const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')

exports.deleteOne = Model => catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndDelete(request.params.id);
    
    if (!document) {
        return next(new AppError('No document found with that id'), 404)
    }
    response.status(204).json({
        status: 'success',
        data: null
    })
})

exports.updateOne = Model => catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true
    })

    if (!document) {
        return next(new AppError('No document found with that id', 404))
    }

    response.status(200).json({
        status: 'success',
        data: {
            data: document
        }
    })
})

exports.createOne = Model => catchAsync(async (request, response, next) => {
    const newDocument = await Model.create(request.body);

    response.status(201).json({
        status: 'success',
        data: {
            data: newDocument
        }
    })
})

exports.getOne = (Model, popOptions) => catchAsync(async (request, response, next) => {

    let query = Model.findById(request.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;

    if (!document) {
        return next(new AppError('No document found with that ID', 404));
    }
    response.status(200).json({
        status: 'success',
        data: {
            data: document
        }
    })
})

exports.getAll = (Model) => catchAsync(async (request, response, next) => {
    //TO ALLOW FOR NESTED ROUTES 
    let filter = {};
    if (request.params.projectId) filter = { project: request.params.projectId }

    const features = new APIFeatures(Model.find(filter), request.query).filter().sort().limitFields().paginate();
    const documents = await features.query;

    response.status(200).json({
        status: 'success',
        results: documents.length,
        data: {
            data: documents
        }
    })
})