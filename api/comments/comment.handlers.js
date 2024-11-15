const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const genericResponse = require('../../utils/genericResponse');

const Comment = require('./comment');
const User = require('../user/user');

const logger = require('../../config/logger');

const { getPostById } = require('../userPosts/post.services');
const commentServices = require('./comment.services');

async function createComment(req, res, next) {

    const authUser = new User(req?.user);

    const payload = req?.body;

    try {

        const { postId } = payload;

        const newComment = new Comment(payload);

        if (!authUser.id) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found");
        }

        const post = await getPostById({ postId });

        if (!post?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, "Post not found");
        }

        newComment.userId = authUser?.id;
        newComment.postId = post.id;

        const createdComment = await newComment.save();

        if (!createdComment?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, "Comment couldn;t be created");
        }

        res.send(genericResponse({ success: true, data: createdComment }));

    } catch (error) {
        logger.info(`[createComment] Error: ${error.message}`);
        res.status(httpStatus.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

async function listCommentsByPost(req, res, next) {

    //const authUser = new User(req?.user);

    const { postId } = req?.params;

    try {

        const post = await getPostById({ postId });

        if (!post?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, "Post doesn't exist");
        }

        const comments = await commentServices.listCommentsByPostId(postId);

        if (!comments) {
            throw new ApiError(httpStatus.NOT_FOUND, "Error getting the comments");
        }

        res.send(genericResponse({ success: true, data: comments }));

    } catch (error) {
        logger.info(`[listCommentsByPost] Error: ${error.message}`);
        res.status(httpStatus.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }

}

async function deleteComment(req, res, next) {
    const authUser = new User(req?.user);

    const { commentId } = req?.params;

    try {

        const comment = await commentServices.getCommentById(commentId);

        if (!comment?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, "No Comment Found");
        }

        await Comment.findOneAndDelete({ _id: commentId });

        res.send(genericResponse({ success: true }));

    } catch (error) {
        logger.info(`[deleteComment] Error: ${error.message}`);
        res.status(httpStatus.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

module.exports = { createComment, listCommentsByPost, deleteComment };