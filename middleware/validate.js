const Joi = require('joi');
const pick = require('../utils/pick');

const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
    const validSchema = pick(schema, ["params", "query", "body"]);
    const object = pick(req, Object.keys(validSchema));

    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: "key" }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details[0]?.message || 'Invalid parameters';
        throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, errorMessage);
    }

    Object.assign(req, value);
    return next();
};

module.exports = validate;