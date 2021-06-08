const mongoose = require("mongoose");

module.exports = Coupon = mongoose.model(
    "Coupon",
    new mongoose.Schema(
        {
            name: {
                type: String,
                trim: true,
                unique: true,
                uppercase: true,
                required: "Name is required",
                minlength: [6, "Name too short"],
                maxlength: [12, "Name too long"],
            },
            expiry: {
                type: Date,
                required: true,
            },
            discount: {
                type: Number,
                required: true,
            },
        },
        {
            timestamps: true,
        }
    ),
    "coupon"
);
