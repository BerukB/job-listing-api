const express = require("express");
const router = express.Router();
const {
  getJob,
  getJobs,
  postJob,
  patchJob,
  deleteJob,
} = require("../controllers/jobControllers");
const { protectCUD } = require("../middleware/authMiddleWare");

router.route("/").get(getJobs).post(protectCUD, postJob);
router
  .route("/:id")
  .get(getJob)
  .patch(protectCUD, patchJob)
  .delete(protectCUD, deleteJob);

module.exports = router;
