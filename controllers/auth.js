const mongoose = require("mongoose");
const get = require("lodash/get");
const User = require("../models/User");
const Role = require("../models/Role");

exports.login = async (req, res) => {
    let { name, picture, email, user_id } = req.user;

    if (!name) {
        name = get(req, "body.name", undefined);
    }

    let user = await User.findOneAndUpdate(
        { email },
        { name, picture, last_login: new Date() },
        { new: true }
    );

    if (user) {
        console.log("USER UPDATED", user);
    } else {
        const role = await Role.findOne({ name: "subscriber" }).select({
            _id: 1,
        });
        if (!role)
            return res.status(412).json({
                err: "No subscriber role found. Contact us for support.",
            });

        user = await new User({
            email,
            name,
            picture,
            firebase_uid: user_id,
            last_login: new Date(),
            role_id: mongoose.Types.ObjectId(role._id),
        }).save();
        console.log("USER CREATED", user);
    }

    user = await User.findOne({ email }).populate({
        path: "role_id",
        model: "Role",
    });
    if (!user) {
        return res.status(404).json({ err: "Not found" });
    }

    user = user.toObject();
    const usr = {};
    Object.assign(usr, { ...user, role: user["role_id"], role_id: undefined });

    return res.json(usr);
};

exports.getUserDetailsByToken = async (req, res) => {
    const { email } = req.user;
    let user = await User.findOne({ email }).populate({
        path: "role_id",
        model: "Role",
    });
    if (user) {
        user = user.toObject();
        const usr = {};
        Object.assign(usr, {
            ...user,
            role: user["role_id"],
            role_id: undefined,
        });
        return res.json(usr);
    }
    return res.json(null);
};
