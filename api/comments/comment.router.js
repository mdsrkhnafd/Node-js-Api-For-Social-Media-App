const express = require('express');
const authUser = require('../../middleware/authUser');
const handlers = require('./comment.handlers');
const validate = require('../../middleware/validate');
const validator = require('./comment.validator');


const router = express.Router();

router.post('/', authUser, validate(validator.createComment), handlers.createComment);
router.get('/:postId', authUser, validate(validator.listComments), handlers.listCommentsByPost);
router.delete('/:commentId', authUser, validate(validator.deleteComment), handlers.deleteComment);





module.exports = router;