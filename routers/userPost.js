const express = require('express');
const UserPost = require('../models/userPost');
const router = new express.Router();

const authUser = require('../middleware/authUser');
const multer = require('multer');
const sharp = require('sharp');

const upload = multer({
    limits: {
        fileSize: 10000000
    }
})

router.post("/userPosts", authUser, async (req, res) => {

    const userPost = new UserPost({
        ...req.body,
        userId: req.user._id
    })

    try {
        await userPost.save();
        res.status(201).send(userPost);
    } catch (error) {
        res.status(400).send(error.message);
    }

});

router.get('/feed', async (req, res) => {

    try {

        const userPosts = await UserPost.find({}).sort({ createdAt: -1 });
        res.send(userPosts);

    } catch (error) {
        res.status(500).send(error.message);
    }

});

router.get('/userPostsWithPagination', async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 2; // const limit = parseInt(req.query.limit) || 2;

        const skip = (page - 1) * limit;

        const userPosts = await UserPost.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        const totalPosts = await UserPost.countDocuments();

        res.send({ userPosts, totalPosts });

    } catch (error) {
        res.status(500).send(error?.message);
    }

});

router.post('/uploadUserPostImage/:id', authUser, upload.single('upload'), async (req, res) => {

    try {
        const userPost = await UserPost.findOne({ _id: req.params.id });

        if (!userPost) {
            throw new Error('Cannot find user post.');
        }

        const buffer = await sharp(req.file.buffer).resize({ width: 350, height: 350 }).png().toBuffer();
        userPost.image = buffer;

        await userPost.save();
        res.send();

    } catch (error) {
        throw new Error(error.message);
    }

}, (error, req, res) => {
    res.status(400).send({ error: error.message });
});

router.get('/userPosts/:id/image', async (req, res) => {
    try {
        const userPost = await UserPost.findById(req.params.id);

        if (!userPost || !userPost.image) {
            throw new Error('This user post does not have an image');
        }

        res.set('Content-Type', 'image/jpg');
        res.send(userPost.image);

    } catch (error) {
        res.status(400).send(error?.message);
    }
})



module.exports = router;