const catchAsync = require("../utils/catchAsync");
const AWS = require("aws-sdk");
const sharp = require("sharp");

AWS.config.update({
  secretAccessKey: process.env.S3_UPLOAD_SECRET,
  accessKeyId: process.env.S3_UPLOAD_KEY,
  region: process.env.S3_UPLOAD_REGION,
});
const s3 = new AWS.S3();

exports.categoryImage = catchAsync(async (req, res, next) => {
  if (!req.file.fieldname) {
    return res.status(400).json({ status: "fail", message: "Enter a File!" });
  }
  res.status(200).json({
    status: "success",
    message: "uploaded successfully",
    data: req.file.Location,
  });
});

exports.profilePhoto = catchAsync(async (req, res, next) => {
  if (!req.file.fieldname) {
    return res.status(400).json({ status: "fail", message: "Enter a File!" });
  }

  res.status(200).json({
    status: "success",
    message: "uploaded successfully",
    data: req.file.Location,
  });
});

exports.adImage = catchAsync(async (req, res, next) => {
  let dataToSend = {};
  if (!req.files?.length) {
    return res.status(400).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
  try {
    const promises = req.files.map(async (file) => {
      const imageXs = await sharp(file.buffer)
        .resize(140, 120, { fit: "inside" })
        .jpeg({ quality: 100 })
        .toBuffer();
      const imageMd = await sharp(file.buffer)
        .resize(300, 500, { fit: "inside" })
        .jpeg({ quality: 100 })
        .toBuffer();
      const imageLg = await sharp(file.buffer)
        .resize(600, 600, { fit: "inside" })
        .jpeg({ quality: 100 })
        .toBuffer();
      const imageOriginal = await sharp(file.buffer)
        .jpeg({ quality: 100 })
        .toBuffer();

      const paramsXs = {
        Bucket: "adsphoto",
        Key: `${file.originalname + new Date()}`,
        Body: imageXs,
        ContentType: file.mimetype,
        ACL: "",
      };
      const paramsMd = {
        Bucket: "adsphoto",
        Key: `${file.originalname + new Date()}`,
        Body: imageMd,
        ContentType: file.mimetype,
        ACL: "",
      };
      const paramsLg = {
        Bucket: "adsphoto",
        Key: `${file.originalname + new Date()}`,
        Body: imageLg,
        ContentType: file.mimetype,
        ACL: "",
      };

      const paramsOriginal = {
        Bucket: "adsphoto",
        Key: `${file.originalname + new Date()}`,
        Body: imageOriginal,
        ContentType: file.mimetype,
        ACL: "",
      };

      const resultXs = await s3.upload(paramsXs).promise();
      const resultMd = await s3.upload(paramsMd).promise();
      const resultLg = await s3.upload(paramsLg).promise();
      const resultOriginal = await s3.upload(paramsOriginal).promise();

      return {
        xs: {
          Location: resultXs.Location,
        },
        md: {
          Location: resultMd.Location,
        },
        lg: {
          Location: resultLg.Location,
        },
        original: {
          Location: resultOriginal.Location,
        },
      };
    });

    dataToSend = await Promise.all(promises);
  } catch (error) {
    console.error("Error processing images:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }

  res.status(200).json({
    status: "success",
    data: dataToSend,
  });
});

exports.bannerPhoto = catchAsync(async (req, res, next) => {
  if (!req.file.fieldname) {
    return res.status(400).json({ status: "fail", message: "Enter a File!" });
  }

  res.status(200).json({
    status: "success",
    message: "uploaded successfully",
    data: req.file.Location,
  });
});
