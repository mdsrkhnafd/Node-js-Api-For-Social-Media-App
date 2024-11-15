const express = require('express');
const mongoClient = require("./db/mongoose")

const userRouter = require("./routers/user")
const userPostRouter = require("./routers/userPost")
const commentRouter = require('./routers/comment');

const mainRouter = require('./api/routes');

const app = express();

const port = process.env.PORT || 8000;

async function startServer() {

    await mongoClient.connect();

    app.get('/test', (req, res) => {
        res.send(`Server is up and running at ${new Date().toString()}`);
    });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    //app.use(userRouter);
    // app.use(userPostRouter);
    // app.use(commentRouter);

    app.use(mainRouter);

    app.listen(port, "0.0.0.0", () => {
        console.log("Server is up on the port and running " + port);
    });
};

startServer()