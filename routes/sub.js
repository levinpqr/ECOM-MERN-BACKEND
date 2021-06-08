const router = require("express").Router();
const { authCheck, adminCheck } = require("../middlewares/auth");

const {
    createSub,
    getSubs,
    getSub,
    updateSub,
    deleteSub,
    listSubs,
} = require("../controllers/sub");

router.post("/", authCheck, adminCheck, createSub);
router.get("/", getSubs);
router.get("/list", listSubs);
router.get("/:slug", getSub);
router.put("/:slug", authCheck, adminCheck, updateSub);
router.delete("/:slug", authCheck, adminCheck, deleteSub);

module.exports = router;
