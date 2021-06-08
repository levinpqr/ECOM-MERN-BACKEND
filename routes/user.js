const router = require("express").Router();
const { authCheck } = require("../middlewares/auth");

const {
    addUserCart,
    getUserCart,
    emptyCart,
    saveAddress,
    getMyAddress,
    applyCouponToUserCart,
} = require("../controllers/user");

router.get("/cart", authCheck, getUserCart);
router.get("/address", authCheck, getMyAddress);
router.post("/cart", authCheck, addUserCart);
router.put("/cart", authCheck, emptyCart);
router.put("/address", authCheck, saveAddress);
router.put("/coupon", authCheck, applyCouponToUserCart);

module.exports = router;
