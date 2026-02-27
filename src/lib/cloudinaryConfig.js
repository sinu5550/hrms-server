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
    resource_type: "auto",
    allowed_formats: ["jpg", "png", "pdf", "jpeg", "doc", "docx"],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

module.exports = { cloudinary, upload };
