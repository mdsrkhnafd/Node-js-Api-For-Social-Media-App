const express = require('express');

const router = express.Router();

const authUser = require('../middleware/authUser');
const Comment = require('../models/comment');


router.post('/comments', authUser, async (req, res) => {

    const comment = new Comment({
        ...req.body,
        userId: req.user._id
    });

    try {
        await comment.save();
        res.status(201).send(comment);

    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }

});

router.get('/comments/:id', async (req, res) => {

    const _id = req.params.id;

    try {

        const comments = await Comment.find({ postId: _id });

        if (!comments) {
            return res.status(404).send();
        }

        res.send(comments);

    } catch (error) {

        res.status(500).send(error.message);

    }

})

module.exports = router;