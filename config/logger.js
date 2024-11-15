const winston = require('winston');
const NODE_ENV = process.env.NODE_ENV;

const enumErrorFormate = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info?.stack });
    }

    return info;
});

const logger = winston.createLogger({
    level: NODE_ENV === "development" ? "debug" : "info",
    format: winston.format.combine(
        enumErrorFormate(),
        NODE_ENV === "developement" ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.printf(({ level, message }) => `${new Date().toISOString()} ${level} ${message}`)
    ),
    transports: [
        new winston.transports.Console({
            stderrLevels: ["error"],
        }),
    ],
});

module.exports = logger; 