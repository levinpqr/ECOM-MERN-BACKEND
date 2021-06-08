const router = require("express").Router();
const { authCheck, adminCheck } = require("../middlewares/auth");

const { login, getUserDetailsByToken } = require("../controllers/auth");

router.post("/login-or-register", authCheck, login);

router.get("/user-by-token", authCheck, getUserDetailsByToken);
router.get("/admin-by-token", authCheck, adminCheck, getUserDetailsByToken);

module.exports = router;
