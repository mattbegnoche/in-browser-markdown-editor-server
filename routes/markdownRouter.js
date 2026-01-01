const express = require('express');
const markdownController = require('../controllers/markdownController');

const router = express.Router();

router
  .route('/')
  .get(markdownController.getAllMarkdown)
  .post(markdownController.createMarkdown);

router
  .route('/:id')
  .get(markdownController.getMarkdown)
  .patch(markdownController.updateMarkdown)
  .delete(markdownController.deleteMarkdown);

module.exports = router;
