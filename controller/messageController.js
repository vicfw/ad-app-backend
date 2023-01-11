const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
exports.allMessages = catchAsync(async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate('sender', 'name photo email')
    .populate('chat');
  res.status(200).json(messages);
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected

exports.sendMessage = catchAsync(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log('Invalid data passed into request');
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  var message = await Message.create(newMessage);

  message = await message.populate('sender', 'name photo').execPopulate();
  message = await message.populate('chat').execPopulate();
  message = await User.populate(message, {
    path: 'chat.users',
    select: 'name photo email',
  });

  await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

  res.status(200).json(message);
});
