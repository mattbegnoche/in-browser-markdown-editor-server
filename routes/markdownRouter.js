const express = require('express');
const markdownController = require('../controllers/markdownController');
const authController = require('../controllers/authController');

const router = express.Router();
// TODO - Implement an option for guests to use the app. That way they do not have to log in, and can try out the app. * This will be nice for my portfolio so

// Protect all routes from public
router.use(authController.protect);

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
