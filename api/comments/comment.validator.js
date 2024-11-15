const Joi = require('joi');
const { param } = require('./comment.router');

const createComment = {
    body: Joi.object().keys({
        text: Joi.string().trim().required(),
        postId: Joi.string().hex().message("postId must be valid").required()
    })
};

const listComments = {
    params: Joi.object().keys({
        postId: Joi.string().hex().message("postId must be valid").required()
    })
};

const deleteComment = {
    params: Joi.object().keys({
        commentId: Joi.string().hex().message("commentId must be valid").required()
    })
};


module.exports = { createComment, listComments, deleteComment };
