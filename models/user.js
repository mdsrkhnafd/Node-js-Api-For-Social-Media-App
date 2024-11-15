const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const apiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const ApiError = require("../utils/ApiError");
const MAX_LOGIN_ATTEMPT = 5;


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validator(value) {
            if (value.lowercase().includes('password')) {
                throw new Error('Password can not contain word password')
            }
        }
    },
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    login_attempt: {
        type: Number,
        required: true,
        default: 0
    }
});

userSchema.virtual('userPosts', {
    ref: 'UserPost',
    localField: '_id',
    foreignField: 'userId'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password;
    return userObject;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, "elephants")

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token;

}

userSchema.pre("save", async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Email is not registered yet');

    }

    if (user?.login_attempt && user?.login_attempt >= MAX_LOGIN_ATTEMPT) {
        throw new ApiError(httpStatus.BAD_RQUEST, 'Max login attemp reached.');
    }

    const isMatch = await bcrypt.compare(password, user?.password);

    if (!isMatch) {
        user.login_attempt = (user?.login_attempt || 0) + 1;
        await user.save()
        throw new ApiError(httpStatus.NOT_FOUND, 'Invalid credentials');

    }
    else {
        user.login_attempt = 0;
        await user.save();
    }

    return user;
}

const User = mongoose.model("User", userSchema);

module.exports = User;