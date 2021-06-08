const get = require("lodash/get");
const Color = require("../models/Color");
const Brand = require("../models/Brand");
const Product = require("../models/Product");
const User = require("../models/User");
const slugify = require("slugify");
const { parseFilters, isNonEmptyArray } = require("../util");

exports.getProductBrands = async (req, res) => {
    let filters = {};
    try {
        filters = JSON.parse(get(req, "query.filter", ""));
    } catch (e) {
        console.log(e);
    }
    const brands = await Brand.find(filters);
    return res.json(brands);
};

exports.getProductColors = async (req, res) => {
    let filters = {};
    try {
        filters = JSON.parse(get(req, "query.filter", ""));
    } catch (e) {
        console.log(e);
    }
    const colors = await Color.find(filters);
    return res.json(colors);
};

exports.createProduct = async (req, res) => {
    const slug = slugify(get(req, "body.title", ""));
    req.body.slug = slug;
    const dupCount = await Product.count({ slug });
    if (dupCount)
        return res
            .status(400)
            .json({ err: `${get(req, "body.title", "")} already exists.` });
    await new Product(get(req, "body"))
        .save()
        .then((newProduct) => res.json(newProduct))
        .catch((e) => {
            console.log(e);
            res.status(400).json({ err: get(e, "message", "Create failed") });
        });
};

exports.getProducts = async (req, res) => {
    const { where, limit, skip, sort } = parseFilters(req);
    const withCount = Boolean(get(req, "query.count"));

    const aggregatePipeline = [];

    let isValidWhere = false;
    let hasCategFilter = false;
    let hasRatingFilter = false;
    let hasSubsFilter = false;
    let hasBrandFilter = false;
    let hasColorFilter = false;
    let hasIdFilter = false;
    const andWhere = get(where, "$and");
    isValidWhere = isNonEmptyArray(andWhere);
    if (isValidWhere) {
        hasCategFilter = andWhere.some((i) => Boolean(i.category_str));
        hasRatingFilter = andWhere.some((i) => Boolean(i.rating_ave));
        hasSubsFilter = andWhere.some((i) => Boolean(i.subs_str));
        hasBrandFilter = andWhere.some((i) => Boolean(i.brand_str));
        hasColorFilter = andWhere.some((i) => Boolean(i.color_str));
        hasIdFilter = andWhere.some((i) => Boolean(i._id_str));
    }

    if (hasCategFilter) {
        aggregatePipeline.push({
            $addFields: { category_str: { $toString: "$category" } },
        });
    }

    if (hasRatingFilter) {
        aggregatePipeline.push({
            $addFields: { rating_ave: { $floor: { $avg: "$ratings.star" } } },
        });
    }

    if (hasSubsFilter) {
        aggregatePipeline.push({
            $addFields: {
                subs_str: {
                    $map: {
                        input: "$subs",
                        as: "sub",
                        in: { $toString: "$$sub" },
                    },
                },
            },
        });
    }

    if (hasBrandFilter) {
        aggregatePipeline.push({
            $addFields: { brand_str: { $toString: "$brand" } },
        });
    }

    if (hasColorFilter) {
        aggregatePipeline.push({
            $addFields: { color_str: { $toString: "$color" } },
        });
    }

    if (hasIdFilter) {
        aggregatePipeline.push({
            $addFields: { _id_str: { $toString: "$_id" } },
        });
    }

    if (where && Object.keys(where).length)
        aggregatePipeline.push({ $match: where });

    Array.prototype.push.apply(aggregatePipeline, [
        {
            $lookup: {
                from: "category",
                let: { category_id: "$category" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$category_id"] } } },
                    { $project: { name: 1, slug: 1 } },
                ],
                as: "category",
            },
        },
        { $addFields: { category: { $first: "$category" } } },
        {
            $lookup: {
                from: "sub",
                let: { sub_id: "$subs" },
                pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$sub_id"] } } },
                    { $project: { name: 1, slug: 1 } },
                ],
                as: "subs",
            },
        },
        {
            $lookup: {
                from: "color",
                let: { color_id: "$color" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$color_id"] } } },
                    { $project: { label: 1 } },
                ],
                as: "color",
            },
        },
        { $addFields: { color: { $first: "$color" } } },
        {
            $lookup: {
                from: "brand",
                let: { brand_id: "$brand" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$brand_id"] } } },
                    { $project: { label: 1 } },
                ],
                as: "brand",
            },
        },
        { $addFields: { brand: { $first: "$brand" } } },
    ]);

    if (hasCategFilter) aggregatePipeline.push({ $unset: "category_str" });
    if (hasRatingFilter) aggregatePipeline.push({ $unset: "rating_ave" });

    if (sort && Object.keys(sort).length)
        aggregatePipeline.push({ $sort: sort });

    aggregatePipeline.push({ $skip: skip });

    if (withCount)
        aggregatePipeline.push({
            $facet: {
                body: [{ $limit: limit }],
                count: [{ $count: "count" }],
            },
        });
    else aggregatePipeline.push({ $limit: limit });

    console.log(JSON.stringify(aggregatePipeline));

    const products = await Product.aggregate(aggregatePipeline);

    if (withCount) {
        return res.json({
            body: get(products[0], "body", []),
            count: get(get(products[0], "count", [])[0], "count", 0),
        });
    } else {
        return res.json(products);
    }
};

exports.updateProduct = async (req, res) => {
    const slug = get(req, "params.slug");
    if (!slug) return res.status(400).json({ err: "Slug required" });
    const prevProduct = await Product.findOne({ slug });
    if (!slug) return res.status(404).json({ err: "Product not found" });
    let body = get(req, "body");
    if (!body) return res.status(400).json({ err: "Body required" });
    const newSlug = slugify(get(req, "body.title", ""));
    body.slug = newSlug;
    body.createdAt = prevProduct.createdAt;
    body.updatedAt = new Date();
    return await Product.findOneAndReplace({ slug }, body)
        .then(() => res.json({ code: 200 }))
        .catch((e) => {
            console.log(e);
            return res.status(500).json({ err: e.message });
        });
};

exports.deleteProduct = async (req, res) => {
    const slug = get(req, "params.slug");
    if (!slug) return res.status(400).json({ err: "Slug required" });
    return await Product.findOneAndDelete({ slug })
        .then(() => res.json({ code: 200 }))
        .catch((e) => {
            console.log(e);
            return res.status(500).json({ err: e.message });
        });
};

exports.updateStars = async (req, res) => {
    const firebase_uid = get(req, "user.user_id");
    const productId = get(req, "params.productId");
    if (!firebase_uid || !productId)
        return res.status(512).json({ err: "Missing dependency" });

    const star = get(req, "body.star");
    if (!star) return res.status(400).json({ err: "Rating required" });

    const user = await User.findOne({ firebase_uid }).select({ _id: 1 });
    const user_id = get(user, "_id");
    if (!user_id) return res.status(512).json({ err: "User ID missing" });

    const product = await Product.findOne({ _id: productId }).select({
        ratings: 1,
    });
    if (!product) return res.status(404).json({ err: "Product not found" });
    let ratings = product.ratings || [];

    const ratingObj = ratings.find(
        (i) => i.postedBy.toString() === user_id.toString()
    );
    if (ratingObj) {
        const newProduct = await Product.updateOne(
            {
                ratings: { $elemMatch: ratingObj },
            },
            {
                $set: { "ratings.$.star": star },
            },
            {
                new: true,
            }
        );
        return res.json(newProduct);
    } else {
        const newProduct = await Product.findByIdAndUpdate(
            productId,
            {
                $push: { ratings: { star, postedBy: user_id } },
            },
            { new: true }
        );
        return res.json(newProduct);
    }
};
