const mongoose = require("mongoose");

module.exports = Color = mongoose.model(
    "Color",
    new mongoose.Schema(
        {
            label: { type: String, required: true, unique: true, index: true },
            value: { type: String, required: true, unique: true, index: true },
        },
        {
            timestamps: true,
        }
    ),
    "color"
);
