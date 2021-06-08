const cloudinary = require("cloudinary");
const get = require("lodash/get");

exports.upload = async (req, res) => {
    const image = get(req, "body.image");
    if (!image) return res.status(400).json({ err: "Image required" });
    const result = await cloudinary.uploader.upload(image, {
        public_id: `${Date.now()}`,
        resource_type: "auto",
    });
    return res.json({
        public_id: result.public_id,
        url: result.secure_url,
    });
};

exports.remove = async (req, res) => {
    const public_id = get(req, "params.public_id");
    if (!public_id) return res.status(400).json({ err: "Public ID required" });
    cloudinary.uploader.destroy(public_id, (result) => {
        console.log(result);
        if (!result || result.result !== "ok")
            return res.status(500).json({ err: "Failed to remove" });
        res.json({ code: 200 });
    });
};
