const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

module.exports = User = mongoose.model(
    "User",
    new mongoose.Schema(
        {
            name: { type: String, required: false },
            email: { type: String, required: true, index: true, unique: true },
            firebase_uid: { type: String, required: true, unique: true },
            // role: { type: String, default: "subscriber" },
            role_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "role",
                required: true,
            },
            cart: { type: Array, default: [] },
            address: { type: String, required: false },
            last_login: { type: Date, required: false },
            // wishlist: [{ type: ObjectId, ref: "Product" }],
        },
        {
            timestamps: true,
        }
    ),
    "user"
);
