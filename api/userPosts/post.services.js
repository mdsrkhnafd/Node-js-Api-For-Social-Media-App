const Post = require('./post');

async function listPosts() {
    return Post.find().sort({ createdAt: -1 });
}

async function listPostsWithPagination(limit, skip) {
    const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Post.countDocuments();

    return { posts, total };
}

async function getPostById({ postId }) {
    return Post.findOne({ _id: postId });
}

module.exports = { listPosts, listPostsWithPagination, getPostById };