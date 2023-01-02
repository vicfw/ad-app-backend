const catchAsync = require('../utils/catchAsync');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

exports.accessChat = catchAsync(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log('UserId param not sent with request');
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name photo email',
  });

  if (isChat.length > 0) {
    res.status(200).json(isChat[0]);
  } else {
    var chatData = {
      chatName: 'sender',
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);
    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      'users',
      '-password'
    );
    res.status(200).json(FullChat);
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected

exports.fetchChats = catchAsync(async (req, res) => {
  Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate('users', '-password')
    .populate('latestMessage')
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, {
        path: 'latestMessage.sender',
        select: 'name PHOTO email',
      });
      res.status(200).send(results);
    });
});
