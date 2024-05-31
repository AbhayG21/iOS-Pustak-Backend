import express from "express";
import jwt from "jsonwebtoken";
import { libraryCollection,userCollection } from "../controllers/database.mjs";

const router = express.Router();
const secret = process.env.SECRET_JWT;

router.post("/create", (req, res) => {
  try {
    const keys = ["id", "libraryName", "phone", "email", "address"];
    const reqKeys = Object.keys(req.body);
    keys.forEach((e) => {
      if (reqKeys.indexOf(e) == -1) {
        throw new Error();
      }
    });

    const token = req.token;
    const tokenPayload = jwt.verify(token, secret);

    const adminEmail = tokenPayload.email;
    libraryCollection.findOne({ email: req.body.email }).then((e) => {
      if (e) res.status(400).json({ message: "Duplicate entry found" });
      else {
        const body = req.body;
        const payLoad = {
          id:body.id,
          libraryName:body.libraryName,
          email:body.email,
          phone:body.phone,
          address:body.address,
          books:[],
          admin:adminEmail
        }
        libraryCollection
          .insertOne(payLoad)
          .then((e) => {
            userCollection.updateOne(
              {email:tokenPayload.email},
              {$push:{libraries:payLoad}}
            )
            res.status(201).json({ message: "Library created" });
          })
          .catch((err) => {
            res.status(400).json({ message: "Something went wrong" });
          });
      }
    });
  } catch {
    res.status(400).json({ message: "Bad request lib" });
  }
});

export default router;