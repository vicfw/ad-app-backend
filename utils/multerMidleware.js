const multer = require('multer');
const aws = require('aws-sdk');
const s3Storage = require('multer-sharp-s3');
const s3 = new aws.S3({});

console.log(process.env.S3_UPLOAD_SECRET, 'process.env.S3_UPLOAD_SECRET');

s3.config.update({
  secretAccessKey: process.env.S3_UPLOAD_SECRET, // Not working key, Your SECRET ACCESS KEY from AWS should go here, never share it!!!
  accessKeyId: process.env.S3_UPLOAD_KEY, // Not working key, Your ACCESS KEY ID from AWS should go here, never share it!!!
  region: process.env.S3_UPLOAD_REGION, // region of your bucket
});

const storage2 = s3Storage({
  s3,
  Bucket: 'adsphoto',
  ACL: '',
  Key: `${process.env.S3_UPLOAD_BUCKET}/${Date.now()}`,
  resize: {
    width: 60,
    height: 60,
  },
  max: true,
});

exports.upload = multer({ storage: storage2 });
