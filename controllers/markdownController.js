const Markdown = require('../models/markdownModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllMarkdown = catchAsync(async (req, res, next) => {
  const docs = await Markdown.find({
    users: { $in: [req.user.id] },
  }).select('-users');

  res.status(200).json({
    status: 'success',
    count: docs.length,
    data: {
      data: docs,
    },
  });
});

exports.getMarkdown = catchAsync(async (req, res, next) => {
  const doc = await Markdown.findOne({
    _id: req.params.id,
    users: req.user.id,
  });

  if (!doc)
    return next(new AppError('Document not found or access denied', 404));

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.updateMarkdown = catchAsync(async (req, res, next) => {
  const doc = await Markdown.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      content: req.body.content,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .where('users')
    .in([req.user.id]);

  if (!doc)
    return next(
      new AppError(
        'No document found with that Id or you do not have access to update this document',
        404,
      ),
    );

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.createMarkdown = catchAsync(async (req, res, next) => {
  const doc = await Markdown.create({
    title: req.body.title,
    content: req.body.content,
    users: [req.user.id],
  });

  res.status(201).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});

exports.deleteMarkdown = catchAsync(async (req, res, next) => {
  const doc = await Markdown.findOneAndDelete({
    _id: req.params.id,
    users: req.user.id,
  });

  if (!doc)
    return next(
      new AppError(
        'No document found with that Id or you do not have access to update this document',
        404,
      ),
    );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
