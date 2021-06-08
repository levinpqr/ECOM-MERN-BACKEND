const mongoose = require("mongoose");

module.exports = Brand = mongoose.model(
    "Brand",
    new mongoose.Schema(
        {
            label: { type: String, required: true, unique: true, index: true },
            value: { type: String, required: true, unique: true, index: true },
        },
        {
            timestamps: true,
        }
    ),
    "brand"
);
