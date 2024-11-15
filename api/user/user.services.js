const User = require('./user');
const { ObjectId } = require('mongoose').Types
const logger = require('../../config/logger');
const ApiError = require('../../utils/ApiError');
const { httpstatus } = require('http-status');


async function getUserByEmailOrUsername({ email, username }) {

    const condition = [];

    if (email) {
        condition.push({ email });
    }
    if (username) {
        condition.push({ username });
    }

    return User.findOne({ $or: condition });

}

async function listUsersQuery() {
    return User.find();
}

async function getUsersByIds(ids) {
    try {
        const objectIds = ids.map(id => new ObjectId(id))

        const users = await User.find({ _id: { $in: objectIds } });

        return users;

    } catch (error) {
        logger.info(`[getUsersByIds] fecthing users failed: ${error}`);
        throw new ApiError(httpstatus.INTERNAL_SERVER_ERROR, "Error fetching users by ids");
    }
}

async function getUserById(id) {
    return User.findById(id);
}

async function followUserAndUpdate({ followerUser, followingUser }) {

    if (!(followerUser instanceof User) || !(followingUser instanceof User)) {

        logger.error(`[follow] user instances are not correct`);
        throw new ApiError(httpstatus.BAD_REQUEST, "Error in the follow process");

    }

    if (!followingUser.followers?.includes(followerUser?.id)) {
        await followingUser.updateOne({ $push: { followers: followerUser?.id } });
    }

    if (!followerUser.followings.includes(followingUser?.id)) {
        await followerUser.updateOne({ $push: { followings: followingUser?.id } });
    }
}

async function unfollowUserAndUpdate({ followerUser, followingUser }) {

    if (!(followerUser instanceof User) || !(followingUser instanceof User)) {

        logger.error(`[follow] user instances are not correct`);
        throw new ApiError(httpstatus.BAD_REQUEST, "Error in the follow process");

    }

    if (followingUser.followers?.includes(followerUser?.id)) {
        await followingUser.updateOne({ $pull: { followers: followerUser?.id } });
    }

    if (followerUser.followings.includes(followingUser?.id)) {
        await followerUser.updateOne({ $pull: { followings: followingUser?.id } });
    }
}

module.exports = { getUserByEmailOrUsername, listUsersQuery, getUsersByIds, getUserById, followUserAndUpdate, unfollowUserAndUpdate };