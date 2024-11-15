const { default: status } = require("http-status");

function genericResponse({ success = true, errorStack = undefined, errorMessage = undefined, data = undefined }) {
    return {
        status: {
            success,
            errorMessage,
            errorStack
        },
        data,
    };
}

module.exports = genericResponse;