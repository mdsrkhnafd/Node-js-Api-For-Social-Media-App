const Comment = require('./comment');

async function listCommentsByPostId(postId) {
    return Comment.find({ postId }).sort({ createdAt: -1 });
}

async function getCommentById(commentId) {
    return Comment.findById(commentId);
}

module.exports = { listCommentsByPostId, getCommentById };