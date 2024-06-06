import express from "express";
import bcrypt from "bcrypt";
import { userCollection,libraryCollection } from "../controllers/database.mjs";
import roles from "../constants/roles.mjs";
import jwt from "jsonwebtoken";
import { librarianPassword } from "../helperFunctions/passGenerator.mjs";

const router = express.Router();
const salt = 10;
const secret = process.env.SECRET_JWT;


router.post("/create", (req, res) => {
    console.log(req.body)
    try {
        const keys = [
        "id",
        "role",
        "name",
        "admin",
        "email",
        "phone",
        "assignedLibrary",
        "personalEmail",]
        const keyBody = Object.keys(req.body);
        keys.forEach((e)=>{
            if(keyBody.indexOf(e) == -1){
                    throw new Error();
            }
        })

        const body = req.body
        let password = librarianPassword()
        bcrypt.hash(password, salt).then((hashPass) => {

            userCollection.findOne({ email: body.email }).then((e) => {
                if (e) { res.status(409).json({ message: "email already exists" }); }
                else{
                    userCollection.insertOne({
                        ...body,
                        password:hashPass
                    }).then((e)=>{
                        userCollection.updateOne(
                            {id:body.admin},
                            {$push:{librarians:body.id}}
                        );

                        libraryCollection.updateOne(
                            {id: body.assignedLibrary},
                            {$set :{librarianAssigned:body.id}}
                        )
                        res.status(201).json({message:"librarian added"})
                    })
                    .catch((error)=>{
                        res.status(400).json({message:"Bad request lb"});
                    });
                }
            })
        })
    } catch {
        res.status(400).json({message:"Bad request lb2"})
    }
});

router.get("/:id", (req, res) => {
      try {
        const id = req.params.id;
        libraryCollection
          .findOne({ id: id })
          .then((e) => {
            if (e && e.librarianAssigned) {
              userCollection.findOne({ id: e.librarianAssigned }).then((resp) => {
                res
                  .status(200)
                  .json({ message: "OK", librarian: resp });
              });
            } else {
              throw new Error();
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Server error" });
          });
      } catch {
        res.status(400).json({ messgae: "Bad request" });
      }
    });

export default router;