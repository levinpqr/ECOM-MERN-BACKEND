const mongoose = require("mongoose");

module.exports = Color = mongoose.model(
    "Cart",
    new mongoose.Schema(
        {
            products: [
                {
                    _id: {
                        type: mongoose.Schema.ObjectId,
                        ref: "product",
                    },
                    count: Number,
                    color: { type: mongoose.Schema.ObjectId, ref: "color" },
                    price: Number,
                },
            ],
            cartTotal: Number,
            totalAfterDiscount: Number,
            orderedBy: { type: mongoose.Schema.ObjectId, ref: "user" },
        },
        {
            timestamps: true,
        }
    ),
    "cart"
);
