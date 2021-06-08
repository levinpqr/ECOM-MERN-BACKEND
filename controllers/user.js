const get = require("lodash/get");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { isNonEmptyArray } = require("../util");
const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");

exports.addUserCart = async (req, res) => {
    const cart = get(req, "body");
    if (!isNonEmptyArray(cart))
        return res.status(400).json({ err: "Cart array required" });

    const email = get(req, "user.email");
    if (!email) return res.status(401).json({ err: "No email address" });
    const user = await User.findOne({ email }).select({ _id: 1 });
    const orderedBy = get(user, "_id");
    if (!orderedBy) return res.status(404).json({ err: "User not found" });

    const existingCart = await Cart.findOne({ orderedBy });
    if (existingCart) existingCart.remove();

    let products = [];
    for (let product of cart) {
        const prod = await Product.findById(product._id).select({
            price: 1,
        });
        if (!product._id || !prod || typeof prod.price !== "number")
            return res.status(400).json({ err: "Failed dependencies" });

        products.push({
            _id: product._id,
            count: product.count,
            color: product.color,
            price: prod.price,
        });
    }

    const cartTotal = products.reduce((aggregatedValue, currentProduct) => {
        return aggregatedValue + currentProduct.price * currentProduct.count;
    }, 0);

    await new Cart({ products, cartTotal, orderedBy }).save();
    res.json({ code: 200 });
};

exports.getUserCart = async (req, res) => {
    const email = get(req, "user.email");
    if (!email) return res.status(401).json({ err: "No email address" });
    const user = await User.findOne({ email }).select({ _id: 1 });
    let orderedBy = get(user, "_id");
    if (!orderedBy) return res.status(404).json({ err: "User not found" });
    orderedBy = mongoose.Types.ObjectId(orderedBy);
    const aggQuery = await Cart.aggregate([
        { $match: { orderedBy } },
        {
            $lookup: {
                from: "product",
                let: { product_id: "$products._id" },
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$product_id"] } } },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            price: 1,
                        },
                    },
                ],
                as: "products_agg",
            },
        },
        {
            $lookup: {
                from: "color",
                let: { color_id: "$products.color" },
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$color_id"] } } },
                    { $project: { label: 1 } },
                ],
                as: "color",
            },
        },
        // { $addFields: { color: { $first: "$color.label" } } },
        { $limit: 1 },
    ]);
    if (!isNonEmptyArray(aggQuery))
        return res.status(404).json({ err: "Not found" });

    res.json(aggQuery[0]);
};

exports.emptyCart = async (req, res) => {
    const email = get(req, "user.email");
    if (!email) return res.status(401).json({ err: "No email address" });
    const user = await User.findOne({ email }).select({ _id: 1 });
    let orderedBy = get(user, "_id");
    if (!orderedBy) return res.status(404).json({ err: "User not found" });
    orderedBy = mongoose.Types.ObjectId(orderedBy);
    const cart = await Cart.findOneAndDelete({ orderedBy });
    res.json(cart);
};

exports.saveAddress = async (req, res) => {
    const email = get(req, "user.email");
    if (!email) return res.status(401).json({ err: "No email address" });
    const address = get(req, "body.address");
    if (!address) return res.status(400).json({ err: "Address required" });
    const userAddress = await User.findOneAndUpdate({ email }, req.body);
    res.json({ code: 200 });
};

exports.getMyAddress = async (req, res) => {
    const email = get(req, "user.email");
    if (!email) return res.status(401).json({ err: "No email address" });
    const user = await User.findOne({ email }).select({ address: 1 });
    res.json(user);
};

exports.applyCouponToUserCart = async (req, res) => {
    const name = get(req, "body.name");
    if (!name) return res.status(400).json({ err: "Name required" });
    const validCoupon = await Coupon.findOne({ name });
    if (!validCoupon) return res.status(404).json({ err: "Coupon not found" });

    const email = get(req, "user.email");
    if (!email) return res.status(401).json({ err: "No email address" });
    const user = await User.findOne({ email }).select({ _id: 1 });
    let orderedBy = get(user, "_id");
    if (!orderedBy) return res.status(404).json({ err: "User not found" });
    orderedBy = mongoose.Types.ObjectId(orderedBy);

    let { products, cartTotal } = await Cart.findOne({ orderedBy }).populate({
        path: "products._id",
        model: "Product",
        select: { _id: 1, title: 1, price: 1 },
    });

    let totalAfterDiscount =
        cartTotal - ((cartTotal * validCoupon.discount) / 100).toFixed(2);

    const query = await Cart.findOneAndUpdate(
        { orderedBy },
        { totalAfterDiscount },
        { new: true }
    );
    return res.json(totalAfterDiscount);
};
