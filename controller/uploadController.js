const catchAsync = require("../utils/catchAsync");
const AWS = require("aws-sdk");
const sharp = require("sharp");

AWS.config.update({
  secretAccessKey: process.env.S3_UPLOAD_SECRET, // Not working key, Your SECRET ACCESS KEY from AWS should go here, never share it!!!
  accessKeyId: process.env.S3_UPLOAD_KEY, // Not working key, Your ACCESS KEY ID from AWS should go here, never share it!!!
  region: process.env.S3_UPLOAD_REGION, // region of your bucket
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

  console.log(req.files, "files");

  try {
    const promises = req.files.map(async (file) => {
      const imageXs = await sharp(file.buffer)
        .jpeg({ quality: 100 })
        .toBuffer();
      const imageMd = await sharp(file.buffer)
        .jpeg({ quality: 100 })
        .toBuffer();
      const imageLg = await sharp(file.buffer)
        .jpeg({ quality: 100 })
        .toBuffer();

      const paramsXs = {
        Bucket: "adsphoto",
        Key: `${file.originalname}`,
        Body: imageXs,
        ContentType: file.mimetype,
        ACL: "",
      };
      const paramsMd = {
        Bucket: "adsphoto",
        Key: `${file.originalname}`,
        Body: imageMd,
        ContentType: file.mimetype,
        ACL: "",
      };
      const paramsLg = {
        Bucket: "adsphoto",
        Key: `${file.originalname}`,
        Body: imageLg,
        ContentType: file.mimetype,
        ACL: "",
      };

      const resultXs = await s3.upload(paramsXs).promise();
      const resultMd = await s3.upload(paramsMd).promise();
      const resultLg = await s3.upload(paramsLg).promise();

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
