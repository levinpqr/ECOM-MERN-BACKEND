const get = require("lodash/get");
const Category = require("../models/Category");
const slugify = require("slugify");
const { parseFilters } = require("../util");

exports.createCategory = async (req, res) => {
    const name = get(req, "body.name", undefined);
    const slug = slugify(name);
    const existingCategory = await Category.findOne({ slug }).select({
        _id: 1,
    });
    if (existingCategory)
        return res.status(404).json({ err: "Category already exists" });
    await new Category({ name, slug })
        .save()
        .then((created) => res.json(created))
        .catch((e) => {
            console.log(e);
            res.status(400).json({ err: get(e, "message", "Create failed") });
        });
};

exports.getCategories = async (req, res) => {
    const { where, limit, sort, skip, fields } = parseFilters(req);
    const withCount = Boolean(get(req, "query.count"));
    const categories = await Category.find(where)
        .select(fields)
        .skip(skip)
        .limit(limit)
        .sort(!Object.keys(sort).length ? { createdAt: -1 } : sort);
    if (withCount) {
        const count = await Category.count(where);
        return res.json({ body: categories, count });
    }
    res.json(categories);
};

exports.getCategory = async (req, res) => {
    const category = await Category.findOne({
        slug: get(req, "params.slug", ""),
    });
    if (!category) res.status(404).json({ err: "Not found" });
    else res.json(category);
};

exports.updateCategory = async (req, res) => {
    const slug = get(req, "params.slug", "");
    const name = get(req, "body.name", "");
    await Category.findOneAndUpdate(
        { slug },
        { name, slug: slugify(name) },
        { new: true }
    )
        .then((updated) => res.json(updated))
        .catch((e) => {
            console.log(e);
            res.status(500).json({ err: e.message });
        });
};

exports.deleteCategory = async (req, res) => {
    const slug = get(req, "params.slug", "");
    await Category.findOneAndDelete({ slug })
        .then((deleted) => res.json(deleted))
        .catch((e) => {
            console.log(e);
            res.status(500).json({ err: e.message });
        });
};
