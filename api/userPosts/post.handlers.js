const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');

const User = require('../user/user');
const Post = require('./post');
const logger = require('../../config/logger');
const genericResponse = require('../../utils/genericResponse');

const sharp = require('sharp');

const postServices = require('./post.services');


const POST_PER_PAGE_LIMIT = 3;

async function createPost(req, res, next) {

    const authUser = new User(req?.user);

    const payload = req?.body;

    try {

        const newPost = Post(payload);

        if (!authUser?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, 'No user found');
        }

        newPost.userId = authUser?.id;

        const createdPost = await newPost.save();

        if (!createdPost?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Error creating the post');
        }

        res.status(200).send(genericResponse({ success: true, data: createdPost }));


    } catch (error) {
        logger.info(`Create post failed ${error.message}`);
        res.status(error.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}


async function listPosts(req, res, next) {

    try {

        const post = await postServices.listPosts();

        if (!post) {
            throw new ApiError(httpStatus.NOT_FOUND, "Error fetching the posts");
        }

        res.send(genericResponse({ success: true, data: post }));

    } catch (error) {
        logger.info(`[ListPosts] Lists post failed ${error.message}`);
        res.status(error.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

async function listPostsWithPagination(req, res, next) {

    const payload = req?.query;
    //const limit = 3; // const limit = parseInt(req.query.limit) || 3;

    try {

        const { page } = payload;

        const skip = (page - 1) * 3;

        const { total, posts } = await postServices.listPostsWithPagination(
            POST_PER_PAGE_LIMIT,
            skip,
        );

        if (!posts) {
            throw new ApiError(httpStatus.NOT_FOUND, "Couldn't fecth the posts");
        }

        res.send(genericResponse({ success: true, data: { posts, total } }));

    } catch (error) {
        logger.info(`[listPostsWithPagination] Error: ${error.message}`);
        res.status(error.statusCode).send(genericResponse({ success: true, errorMessage: error.message }));
    }

}

async function uploadPostImage(req, res, next) {
    const payload = req?.query;

    try {
        const { postId } = payload;

        const post = await postServices.getPostById({ postId });

        if (!post?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, "No post with given id");
        }

        const buffer = await sharp(req?.file?.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

        post.image = buffer;

        const updatedPost = await post.save();

        if (!updatedPost) {
            throw new ApiError(httpStatus.NOT_FOUND, "Error updating the image");
        }

        res.send(genericResponse({ success: true, data: updatedPost }));

    } catch (error) {

        logger.info(`[uploadedPostImage] Failed with error: ${error.message}`);
        res.status(error.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));

    }
}

async function getPostImageById(req, res, next) {
    const { postId } = req?.params;

    try {
        const post = await postServices.getPostById({ postId });

        if (!post?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, "No Post Found");
        }

        if (!post?.image) {
            throw new ApiError(httpStatus.NOT_FOUND, "Post has no image");
        }

        res.set("Content-Type", "image/jpg");
        res.send(post?.image);

    } catch (error) {
        logger.info(`[getPostImageId] Error: ${error.message}`);

        // Set a default status code if error.statusCode is undefined
        const statusCode = error.statusCode || 500;  // Default to 500 for unexpected errors
        res.status(statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}


async function likePost(req, res, next) {
    const { postId } = req?.body;

    const authUser = new User(req?.user);

    try {

        const post = await postServices.getPostById({ postId });

        if (!post?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, "No post found");
        }

        if (!post?.likes.includes(authUser?.id)) {
            await post.updateOne({ $push: { likes: authUser?.id } });
        }

        res.send(genericResponse({ success: true }));

    } catch (error) {
        logger.info(`[likePost] Error: ${error.message}`);
        res.status(httpStatus.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

async function unlikePost(req, res, next) {
    const { postId } = req?.body;

    const authUser = new User(req?.user);

    try {

        const post = await postServices.getPostById({ postId });

        if (!post?.id) {
            throw new ApiError(httpStatus.NOT_FOUND, "No post found");
        }

        if (post?.likes.includes(authUser?.id)) {
            await post.updateOne({ $pull: { likes: authUser?.id } });
        }

        res.send(genericResponse({ success: true }));

    } catch (error) {
        logger.info(`[likePost] Error: ${error.message}`);
        res.status(httpStatus.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

module.exports = { createPost, listPosts, listPostsWithPagination, uploadPostImage, getPostImageById, likePost, unlikePost };