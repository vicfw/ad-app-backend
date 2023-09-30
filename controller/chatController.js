const catchAsync = require("../utils/catchAsync");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const factory = require("./handlerFactory");
const Message = require("../models/messageModel");

exports.accessChat = catchAsync(async (req, res) => {
  const { userId, adId } = req.body;

  if (!userId || !adId) {
    return res
      .status(400)
      .json({ status: "error", message: "UserId param not sent with request" });
  }

  var isChat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate({
      path: "users",
      select: "-notificationToken",
    })
    .populate("latestMessage")
    .populate("ad");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name photo email",
  });

  let isValid = false;

  isChat.forEach((chat) => {
    if (chat.ad._id === adId) {
      isValid = true;
    }
  });

  if (isValid) {
    res.status(200).json(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      users: [req.user._id, userId],
      ad: adId,
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id })
      .populate("users", "-notificationToken")
      .populate("ad");
    res.status(200).json(fullChat);
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected

exports.fetchChats = catchAsync(async (req, res) => {
  Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate({ path: "users", select: "-notificationToken" })
    .populate("latestMessage")
    .populate("ad")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, {
        path: "latestMessage.sender",
        select: "name photo email",
      });
      res.status(200).send(results);
    });
});

exports.deleteChat = catchAsync(async (req, res, next) => {
  const doc = await Chat.findByIdAndDelete(req.params.id);
  await Message.remove({ chat: req.params.id });

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
