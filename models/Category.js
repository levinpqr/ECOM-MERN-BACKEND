const mongoose = require("mongoose");

module.exports = Category = mongoose.model(
    "Category",
    new mongoose.Schema(
        {
            name: {
                type: String,
                required: [true, "Name is required"],
                trim: true,
                minlength: [2, "Name is too short"],
                maxlength: [32, "Name is too long"],
            },
            slug: {
                type: String,
                unique: true,
                lowercase: true,
                index: true,
            },
        },
        {
            timestamps: true,
        }
    ),
    "category"
);
