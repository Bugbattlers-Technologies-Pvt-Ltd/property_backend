const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
} = process.env;

// ✅ DigitalOcean Spaces endpoint
const spacesEndpoint = new aws.Endpoint("blr1.digitaloceanspaces.com");

const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: AWS_BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileExt = file.originalname.split(".").pop();
      const name = `${file.fieldname}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      cb(null, name);
    },
  }),
});

const multiUpload = upload.fields([
  { name: "satbara", maxCount: 1 },
  { name: "ferfar", maxCount: 1 },
  { name: "photos", maxCount: 10 }, // ✅ fixed field name
  { name: "eightA", maxCount: 1 },
  { name: "tochNakasha", maxCount: 1 },
  { name: "registryDocument", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
  { name: "agentProofDocs", maxCount: 5 },
  { name: "importantDocs", maxCount: 5 },
  { name: "photo", maxCount: 1 },
]);

module.exports = { multiUpload };
