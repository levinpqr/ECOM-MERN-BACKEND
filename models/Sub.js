const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema.Types;
module.exports = Sub = mongoose.model(
    "Sub",
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
            parent: {
                type: ObjectId,
                ref: "category",
                required: true
            }
        },
        {
            timestamps: true,
        }
    ),
    "sub"
);
