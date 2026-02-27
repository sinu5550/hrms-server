const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "dddwxyeod",
  api_key: "371418848131433",
  api_secret: "wsuF_KeeRU-VqkoXvWfduPsWNB4",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hrms-uploads",
    allowed_formats: ["jpg", "png", "pdf", "jpeg"],
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
