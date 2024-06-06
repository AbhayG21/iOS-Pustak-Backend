import express from "express"
import roles from "../constants/roles.mjs"
import bcrypt from "bcrypt"
import { libraryAdminPassword } from "../helperFunctions/passGenerator.mjs"
import database from "../controllers/database.mjs"
import { userCollection } from "../controllers/database.mjs"
const router = express.Router()

router.post("/create", (req, res) => {
  try{
    const reqKeys = [
      "id",
      "name",
      "email",
      "personalEmail",
      "phone",
      "role",
      "libraries",
      "librarians",
    ]
    const keys = Object.keys(req.body);
    reqKeys.forEach((e) => {
      if (keys.indexOf(e) == -1) {
        throw new Error();
      }
    });
      let payLoad = {
        ...req.body,
      };

      const password = libraryAdminPassword();
      const salt = 10
      bcrypt.hash(password,salt).then((e)=>{
        const hashPass = e;
        payLoad = {
          ...payLoad,
          password:hashPass
        }

        userCollection.findOne({email:req.body.loginEmail}).then((e)=>{
          if(e){
            res.status(400).json({message:"user already exists"});
          }
          else{
            userCollection.insertOne(payLoad).then((e)=>{
              res.status(201).json({message:"Admin created"});
            })
            .catch((error)=>{
              res.status(400).json({message:"Bad request LA"})
            })
          }
        })

      });

  }catch{
    res.status(400).json({message:"Bad requesst LA2"})
  }
});

router.get("/", (req, res) => {
  try {
    userCollection
      .find({
        role:roles.LA
      })
      .project({ password: 0 })
      .toArray()
      .then((e) => {
        res.status(200).json(e);
      })
      .catch((err) => {
        res.status(404).json({ message: "Not found" });
      });
  } catch {
    res.status(400).json({ message: "Bad request a" });
  }
});

export default router;
