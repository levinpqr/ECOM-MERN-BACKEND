const router = require("express").Router();
const { authCheck, adminCheck } = require("../middlewares/auth");
const cloudinary = require("cloudinary");
const { upload, remove } = require("../controllers/cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/upload", authCheck, adminCheck, upload);
router.delete("/:public_id", authCheck, adminCheck, remove);

module.exports = router;
