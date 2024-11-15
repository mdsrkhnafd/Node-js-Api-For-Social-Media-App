const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ApiError = require('../utils/ApiError')
const httpStatus = require('http-status');


const authUser = async (req, res, next) => {
    try {
        const token = req?.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            console.log("JWT auth token is not given");
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication token is missing')
        }

        const { _id } = jwt.verify(token, "elephants");

        const user = _id ? await User.findById({ _id }) : null;

        if (!user?._id) {
            console.log("Invalid token")
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token')
        }

        req.user = user;
        next();


    } catch (error) {
        console.log(error.message);
        next(new ApiError(httpStatus.UNAUTHORIZED, error?.message || "Invalid token"));
    }
}

module.exports = authUser;