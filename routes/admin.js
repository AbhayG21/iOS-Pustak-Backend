const express = require("express");
const verifirer  = require("../middleware/tokenVerifier");
const roles = require("../constants/roles");
const router = express.Router();

router.post("/create", (req, res) => {
  console.log(req.body);
  res.status(200).json({ message: "OK admin creation" });
});

module.exports = router;
