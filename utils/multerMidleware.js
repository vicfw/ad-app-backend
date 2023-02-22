const multer = require('multer');
const aws = require('aws-sdk');
const s3Storage = require('multer-sharp-s3');
const s3 = new aws.S3({});
const crypto = require('crypto');

s3.config.update({
  secretAccessKey: process.env.S3_UPLOAD_SECRET, // Not working key, Your SECRET ACCESS KEY from AWS should go here, never share it!!!
  accessKeyId: process.env.S3_UPLOAD_KEY, // Not working key, Your ACCESS KEY ID from AWS should go here, never share it!!!
  region: process.env.S3_UPLOAD_REGION, // region of your bucket
});

const storage2 = s3Storage({
  s3,
  Bucket: 'adsphoto',
  ACL: '',
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString('hex'));
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
  Bucket: 'adsphoto',
  ACL: '',
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString('hex'));
    });
  },
  resize: {
    width: 100,
    height: 100,
  },
  max: true,
});

const adPhotoStorage = s3Storage({
  s3,
  Bucket: 'adsphoto',
  ACL: '',
  // Key: `${process.env.S3_UPLOAD_BUCKET}/adImages/${Date.now()}`,
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString('hex'));
    });
  },
  resize: [
    // { suffix: 'xlg', width: 1200, height: 1200 },
    // { suffix: 'lg', width: 800, height: 800 },
    { suffix: 'md', width: 300, height: 500 },
    { suffix: 'lg', width: 600, height: 600 },
    // { suffix: 'sm', width: 300, height: 300 },
    { suffix: 'xs', width: 140, height: 120 },
  ],
  max: true,
  multiple: true,
});

exports.upload = multer({ storage: storage2 });
exports.profilePhotoUpload = multer({ storage: profilePhotoStorage });
exports.adImageUpload = multer({
  storage: adPhotoStorage,
  // limits: { fieldSize: 25 * 1024 * 1024 },
});
