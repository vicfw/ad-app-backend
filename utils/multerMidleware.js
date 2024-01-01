const multer = require("multer");
const aws = require("aws-sdk");
const s3Storage = require("multer-sharp-s3");
const s3 = new aws.S3();
const crypto = require("crypto");

s3.config.update({
  secretAccessKey: process.env.S3_UPLOAD_SECRET, // Not working key, Your SECRET ACCESS KEY from AWS should go here, never share it!!!
  accessKeyId: process.env.S3_UPLOAD_KEY, // Not working key, Your ACCESS KEY ID from AWS should go here, never share it!!!
  region: process.env.S3_UPLOAD_REGION, // region of your bucket
});

const storage2 = s3Storage({
  s3,
  Bucket: "adsphoto",
  ACL: "",
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString("hex"));
    });
  },
  resize: {
    width: 60,
    height: 60,
  },
  max: true,
});

const profilePhotoStorage = s3Storage({
  s3,
  Bucket: "adsphoto",
  ACL: "",
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString("hex"));
    });
  },
  resize: {
    width: 100,
    height: 100,
  },
  max: true,
});

const bannerImage = s3Storage({
  s3,
  Bucket: "adsphoto",
  ACL: "",
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString("hex"));
    });
  },
  max: true,
});

exports.upload = multer({ storage: storage2 });
exports.profilePhotoUpload = multer({ storage: profilePhotoStorage });
exports.bannerImageUpload = multer({ storage: bannerImage });
