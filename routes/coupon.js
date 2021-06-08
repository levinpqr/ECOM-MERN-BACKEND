const router = require("express").Router();
const { authCheck, adminCheck } = require("../middlewares/auth");

const {
    createCoupon,
    removeCoupon,
    listCoupon,
} = require("../controllers/coupon");

router.post("/", authCheck, adminCheck, createCoupon);
router.get("/", listCoupon);
router.delete("/:couponId", authCheck, adminCheck, removeCoupon);

module.exports = router;
