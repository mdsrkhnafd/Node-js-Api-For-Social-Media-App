const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');

const User = require('./user');
const genericResponse = require('../../utils/genericResponse');
const logger = require('../../config/logger');
const { getUserByEmailOrUsername, listUsersQuery, getUsersByIds, getUserById, followUserAndUpdate, unfollowUserAndUpdate } = require('./user.services');

// const sharp = require('sharp');

async function login(req, res, next) {
    const payload = req.body;

    try {
        let { email, password } = payload;

        const user = await User.findByCredentials(email, password);

        const token = await user.generateAuthToken();

        res.send(genericResponse({ data: { user, token } }));
    } catch (error) {
        logger.info(`[login] Login failed with error`, payload, error);
        next(error)
    }
}

async function createUser(req, res, next) {
    try {
        const payload = req.body;
        const newUser = new User(payload);

        const { email, username } = payload;

        const user = await getUserByEmailOrUsername({ email, username });

        if (user) {
            if (user.username === username) {
                throw new ApiError(400, 'This username is already taken');
            }
            if (user.email === email) {
                throw new ApiError(400, 'This email is already taken');
            }
        }

        await newUser.save();
        const token = await newUser.generateAuthToken();

        res.send(genericResponse({ data: { user: newUser, token: token } }));

    } catch (error) {
        logger.info(`[CreateUser] Create User failed with error`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

async function listUsers(req, res, next) {

    try {
        const users = await listUsersQuery();

        if (!users) {
            throw new ApiError(httpStatus.NOT_FOUND, "Can't find any users");
        }

        res.send(genericResponse({ success: true, data: { users } }));

    } catch (error) {
        logger.info(`[ListUsers] List Users failed with error`, error);
        res.status(error.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

async function getUsersByIdsHandler(req, res, next) {
    try {
        const { ids } = req.body; // Assuming IDs are sent in the body

        // Validate Input
        if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) {

            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Id Input");
        }

        // Fetch Users
        const users = await getUsersByIds(ids);

        // Check If users were found
        if (!users || users.length == 0) {
            throw new ApiError(httpStatus.NOT_FOUND, "No users found with this ids");
        }

        // Send response
        res.send(genericResponse({
            success: true,
            status: httpStatus.OK,
            data: users.map(user => user.toJSON()), // Assuming .toJSON() method normalizes the user object for response
        }));

    } catch (error) {
        logger.info(`[GetUsersByIds] Fetching users failed: ${error.message}`);
        res.status(error.statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

async function followUser(req, res, next) {
    const payload = req?.body;
    const followerUser = new User(req?.user);

    try {
        let { followingUserId } = payload;

        if (followerUser?.id === followingUserId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User cannot follow themselves");
        }

        const followingUser = await getUserById(followingUserId);

        if (!followingUser) {
            throw new ApiError(httpStatus.NOT_FOUND, "This user does not exist");
        }

        await followUserAndUpdate({ followerUser, followingUser });

        res.send(genericResponse({ success: true }));

    } catch (error) {
        logger.info(`[followUser] Error: ${error.message}`);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

async function unfollowUser(req, res, next) {
    const payload = req?.body;
    const followerUser = new User(req?.user);

    try {
        let { followingUserId } = payload;

        if (followerUser?.id === followingUserId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User cannot follow themselves");
        }

        const followingUser = await getUserById(followingUserId);

        if (!followingUser) {
            throw new ApiError(httpStatus.NOT_FOUND, "This user does not exist");
        }

        await unfollowUserAndUpdate({ followerUser, followingUser });

        res.send(genericResponse({ success: true }));

    } catch (error) {
        logger.info(`[followUser] Error: ${error.message}`);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).send(genericResponse({ success: false, errorMessage: error.message }));
    }
}

module.exports = { login, createUser, listUsers, getUsersByIdsHandler, followUser, unfollowUser };