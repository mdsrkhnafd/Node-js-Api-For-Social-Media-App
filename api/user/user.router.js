const express = require('express');

const router = express.Router();
const handler = require('./user.handlers');
const validator = require('./user.validator');
const authUser = require('../../middleware/authUser');

const validate = require('../../middleware/validate');

// login methode
router.post('/login', validate(validator.login), handler.login);

// create new user
router.post('/', handler.createUser);

// get all user
router.get('/list', authUser, handler.listUsers);

// get UsersByIds
router.post('/getUsersByIds', authUser, validate(validator.userByIds), handler.getUsersByIdsHandler);

// follow user
router.post('/follow', authUser, validate(validator.followUser), handler.followUser);

// unfollow user
router.post('/unfollow', authUser, validate(validator.followUser), handler.unfollowUser);


module.exports = router;