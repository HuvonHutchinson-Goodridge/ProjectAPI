const express = require('express');
const router = express.Router();
const bugRouter = require('./bugRoutes')
const projectController = require('./../controllers/projectController')
const authController = require('./../controllers/authController')


router.use(authController.protect);

router.use('/:projectId/bugs', bugRouter);

router.route('/')
    .get(projectController.getAllProjects)
    .post(authController.restrictTo('admin'), projectController.createProject)

router.route('/:id')
    .get(projectController.getProject)
    .patch(authController.restrictTo('admin'),
        projectController.updateProject)
    .delete(authController.restrictTo('admin'),
        projectController.createProject);

module.exports = router;