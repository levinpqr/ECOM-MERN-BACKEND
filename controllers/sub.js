const get = require("lodash/get");
const Sub = require("../models/Sub");
const Category = require("../models/Category");
const slugify = require("slugify");
const { parseFilters } = require("../util");

exports.createSub = async (req, res) => {
    const name = get(req, "body.name", undefined);
    const parent = get(req, "body.parent", undefined);
    if (!parent) return res.status(400).json({ err: "Parent required" });
    const slug = slugify(name);
    const existing = await Sub.findOne({ slug }).select({
        _id: 1,
    });
    if (existing) return res.status(404).json({ err: "Sub already exists" });
    const category = await Category.findOne({ slug: parent }).select({
        _id: 1,
    });
    if (!category) return res.status(404).json({ err: "Parent not found" });
    const parent_id = get(category, "_id", undefined);
    await new Sub({ name, slug, parent: parent_id })
        .save()
        .then((created) => res.json(created))
        .catch((e) => {
            console.log(e);
            res.status(400).json({ err: get(e, "message", "Create failed") });
        });
};

exports.getSubs = async (req, res) => {
    let filters = {};
    let sort = { createdAt: -1 };
    let fields = {};
    try {
        filters = JSON.parse(get(req, "query.filter", ""));
        sort = get(filters, "order", { createdAt: -1 });
        fields = JSON.parse(get(req, "query.fields", "{}"));
    } catch (e) {
        console.log(e);
    }
    res.json(await Sub.find(filters).sort(sort).select(fields));
};

exports.getSub = async (req, res) => {
    const sub = await Sub.findOne({
        slug: get(req, "params.slug", ""),
    });
    if (!sub) res.status(404).json({ err: "Not found" });
    else res.json(sub);
};

exports.updateSub = async (req, res) => {
    const slug = get(req, "params.slug", "");
    const name = get(req, "body.name", "");
    const parent = get(req, "body.parent", "");
    await Sub.findOneAndUpdate(
        { slug },
        { name, slug: slugify(name), parent },
        { new: true }
    )
        .then((updated) => res.json(updated))
        .catch((e) => {
            console.log(e);
            res.status(500).json({ err: e.message });
        });
};

exports.deleteSub = async (req, res) => {
    const slug = get(req, "params.slug", "");
    await Sub.findOneAndDelete({ slug })
        .then((deleted) => res.json(deleted))
        .catch((e) => {
            console.log(e);
            res.status(500).json({ err: e.message });
        });
};

exports.listSubs = async (req, res) => {
    console.log("HEY!!");
    const { where, limit, skip, sort } = parseFilters(req);
    console.log("LIMIT", limit)
    const withCount = Boolean(get(req, "query.count"));
    const subs = await Sub.find(where)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
            path: "parent",
            model: "Category",
            select: { name: 1, slug: 1 },
        });
    if (withCount) {
        const count = await Sub.count(where);
        return res.json({ body: subs, count });
    }
    return res.json(subs);
};
