import express from "express";
const router = express.Router();

router.post("/create", (req, res) => {
  res.status(201).json({ message: "Ok to add librarian" });
});

router.get("/", (res, req) => {});

export default router;