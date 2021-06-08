const router = require("express").Router();
const { authCheck, adminCheck } = require("../middlewares/auth");

const {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/category");

router.post("/", authCheck, adminCheck, createCategory);
router.get("/", getCategories);
router.get("/:slug", getCategory);
router.put("/:slug", authCheck, adminCheck, updateCategory);
router.delete("/:slug", authCheck, adminCheck, deleteCategory);

module.exports = router;
