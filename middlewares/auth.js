const admin = require("../firebase");
const get = require("lodash/get");
const User = require("../models/User");

exports.authCheck = async (req, res, next) => {
    const token = get(req, "headers.authtoken");
    if (!token) return res.status(401).json({ err: "Invalid session" });
    await admin
        .auth()
        .verifyIdToken(token)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((e) => {
            console.log(e);
            res.status(403).json({ err: "Invalid session" });
        });
};

exports.adminCheck = async (req, res, next) => {
    const email = get(req, "user.email", "");
    if (!email) return res.status(400).json({ err: "No email given" });
    const usr = await User.findOne({ email }).select({ role_id: 1, _id: 0 }).populate({
        path: "role_id",
        model: "Role",
        select: ['name']
    });
    if (!usr) return res.status(404).json({ err: "No users found" });
    if (get(usr, "role_id.name", "") === "admin") next();
    else res.status(403).json({ err: "Unauthorized" });
};
