const express = require('express');
const userRoutes = require('./user/user.router');
const postRoutes = require('./userPosts/post.router');
const commentRoutes = require('./comments/comment.router');

const router = express.Router();

router.use('/user', userRoutes);
router.use('/post', postRoutes);
router.use('/comment', commentRoutes);


module.exports = router;