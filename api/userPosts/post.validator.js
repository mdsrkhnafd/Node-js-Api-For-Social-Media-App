const { query } = require('express');
const Joi = require('joi');
const { param } = require('./post.router');

const createPost = {
    body: Joi.object().keys({
        title: Joi.string().trim().required(),
        // userId: Joi.string().trim().required()
    })
};

const listsPostsWithPagination = {
    query: Joi.object().keys({
        page: Joi.number().optional().default(1),
    })
};

const uploadPostImage = {
    query: Joi.object().keys({
        postId: Joi.string().hex().message("postId must be valid").length(24).required()
    })
}

const getPostImage = {
    params: Joi.object().keys({
        postId: Joi.string().hex().message("postId must be valid").length(24).required()
    })
}

const likePost = {
    body: Joi.object().keys({
        postId: Joi.string().hex().message("postId must be valid").length(24).required()
    })
}

module.exports = { createPost, listsPostsWithPagination, uploadPostImage, getPostImage, likePost };