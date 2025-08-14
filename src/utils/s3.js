const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const spacesEndpoint = new AWS.Endpoint('blr1.digitaloceanspaces.com');

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
});

const uploadFileToS3 = async (file) => {
  const fileKey = `employee-docs/${uuidv4()}-${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // Optional, makes files publicly accessible
  };

  try {
    const result = await s3.upload(params).promise();

    return {
      url: result.Location,
      key: result.Key,
    };
  } catch (err) {
    console.error("❌ S3 Upload Error:", err.message);
    throw new Error("S3 upload failed: " + err.message);
  }
};

const deleteFileFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (err) {
    console.error("❌ S3 Delete Error:", err.message);
    throw new Error("S3 delete failed: " + err.message);
  }
};

module.exports = { uploadFileToS3, deleteFileFromS3 };
