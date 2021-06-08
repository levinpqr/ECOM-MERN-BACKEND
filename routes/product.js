const router = require("express").Router();
const { authCheck, adminCheck } = require("../middlewares/auth");

const {
    createProduct,
    getProductColors,
    getProductBrands,
    getProducts,
    deleteProduct,
    updateProduct,
    updateStars,
} = require("../controllers/product");

router.post("/", authCheck, adminCheck, createProduct);
router.get("/colors", getProductColors);
router.get("/brands", getProductBrands);
router.get("/", getProducts);
router.delete("/:slug", authCheck, adminCheck, deleteProduct);
router.put("/:slug", authCheck, adminCheck, updateProduct);
router.put("/rate/:productId", authCheck, updateStars);

module.exports = router;
