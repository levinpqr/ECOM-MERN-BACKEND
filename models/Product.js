const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

module.exports = Product = mongoose.model(
    "Product",
    new mongoose.Schema(
        {
            title: {
                type: String,
                trim: true,
                required: true,
                maxlength: 32,
                text: true,
            },
            slug: {
                type: String,
                unique: true,
                required: true,
                lowercase: true,
                index: true,
            },
            description: {
                type: String,
                required: true,
                maxlength: 2000,
                text: true,
            },
            price: {
                type: Number,
                trim: true,
                required: true,
                maxlength: 32,
            },
            category: {
                type: ObjectId,
                ref: "category",
            },
            subs: [
                {
                    type: ObjectId,
                    ref: "sub",
                },
            ],
            quantity: Number,
            sold: {
                type: Number,
                default: 0,
            },
            images: {
                type: Array,
            },
            shipping: {
                type: String,
                enum: ["Yes", "No"],
            },
            color: {
                type: ObjectId,
                ref: "color",
            },
            brand: {
                type: ObjectId,
                ref: "brand",
            },
            ratings: [
                {
                    star: Number,
                    postedBy: { type: ObjectId, ref: "user" },
                },
            ],
        },
        {
            timestamps: true,
        }
    ),
    "product"
);
