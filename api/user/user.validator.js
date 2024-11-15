const Joi = require('joi');

const login = {
    body: Joi.object().keys({
        email: Joi.string().email().message('Invalid email').trim().required(),
        password: Joi.string().trim().required()
    })
}

const userByIds = {
    body: Joi.object().keys({
        ids: Joi.array().items(Joi.string().hex().length(24).message("Invalid User Id")).required().messages({ "array.base": "IDs must be in an array formate" })
    })
}

const followUser = {
    body: Joi.object().keys({
        followingUserId: Joi.string().hex().message('Invalid userId').length(24).required()
    })
}

module.exports = { login, userByIds, followUser };