const Markdown = require('../models/markdownModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getAllMarkdown = factory.getAll(Markdown);
exports.getMarkdown = factory.getOne(Markdown);
exports.createMarkdown = factory.createOne(Markdown);
exports.updateMarkdown = factory.updateOne(Markdown);
exports.deleteMarkdown = factory.deleteOne(Markdown);
