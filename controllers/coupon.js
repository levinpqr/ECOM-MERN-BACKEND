const get = require("lodash/get");
const Coupon = require("../models/Coupon");
const { parseFilters, isNonEmptyArray } = require("../util");

exports.createCoupon = async (req, res) => {
    const reqBody = get(req, "body");
    if (
        !get(reqBody, "name") ||
        !get(reqBody, "expiry") ||
        !get(reqBody, "discount")
    ) {
        return res.status(400).json({ err: "Bad request" });
    }
    const { name, expiry, discount } = req.body;
    try {
        const newCoupon = await new Coupon({ name, expiry, discount }).save();
        return res.json(newCoupon);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ err: e.message });
    }
};

exports.removeCoupon = async (req, res) => {
    const id = get(req, "params.couponId");
    if (!id) return res.status(400).json({ err: "Id required" });
    const query = await Coupon.findByIdAndDelete(id).catch((e) => {
        console.log(e);
    });
    return res.json(query);
};

exports.listCoupon = async (req, res) => {
    const { where, limit, skip, sort, fields } = parseFilters(req);

    const items = await Coupon.find(where)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(fields);

    return res.json(items);
};
