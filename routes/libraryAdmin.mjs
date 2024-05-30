import express from "express"
import tokenVerifier from "../middleware/tokenVerifier.mjs"
import roles from "../constants/roles.mjs"
import bcrypt from "bcrypt"
import { libraryAdminPassword } from "../helperFunctions/passGenerator.mjs"
import database from "../controllers/database.mjs"
const userCol = database.collection("pustak")
const router = express.Router()

router.post("/create", (req, res) => {
  try{
    const name = req.body.name
    const email = req.body.email
    const phone = req.body.phone
    const id = req.body.id

    if(!name || !email || !phone || !id)
      {
        throw new Error();
      }
      let payLoad = {
        id: id,
        name:name,
        email:email,
        phone:phone,
        role:roles.LA
      };

      const password = libraryAdminPassword();
      const salt = 10
      bcrypt.hash(password,salt).then((e)=>{
        const hashPass = e;
        payLoad = {
          ...payLoad,
          password:hashPass
        }

        userCol.findOne({email:email}).then((e)=>{
          if(e){
            res.status(400).json({message:"user already exists"});
          }
          else{
            userCol.insertOne(payLoad).then((e)=>{
              res.status(201).json({message:"Admin created"});
            })
            .catch((error)=>{
              res.status(400).json({message:"Bad request"})
            })
          }
        })

      });

  }catch{
    res.status(400).json({message:"Bad requesst 2"})
  }
});

export default router;
