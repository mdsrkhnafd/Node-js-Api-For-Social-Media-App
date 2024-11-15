const express = require('express');
const authUser = require('../../middleware/authUser');

const handlers = require('./post.handlers');
const validator = require('./post.validator');
const validate = require('../../middleware/validate');
const uploader = require('../helpers/multer');


const router = express.Router();

router.post('/', authUser, validate(validator.createPost), handlers.createPost);
router.get('/list', authUser, handlers.listPosts);
router.get('/listPostsWithPagination', authUser, validate(validator.listsPostsWithPagination), handlers.listPostsWithPagination);
router.post('/uploadPostImage', authUser, uploader.single('upload'), validate(validator.uploadPostImage), handlers.uploadPostImage);
router.get('/image/:postId', validate(validator.getPostImage), handlers.getPostImageById);
router.post('/like', authUser, validate(validator.likePost), handlers.likePost);
router.post('/unlike', authUser, validate(validator.likePost), handlers.unlikePost);


module.exports = router;