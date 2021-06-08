const mongoose = require("mongoose");

module.exports = Role = mongoose.model(
    "Role",
    new mongoose.Schema(
        {
            name: { type: String, required: true, unique: true, index: true },
            login_redirect: { type: String, required: true },
            dashboard_redirect: { type: String, required: false },
            dashboard_items: [
                { label: { type: String }, value: { type: String } },
            ],
        },
        {
            timestamps: true,
        }
    ),
    "role"
);
