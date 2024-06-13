import express from "express";
import bcrypt from "bcrypt";
import { userCollection,libraryCollection } from "../controllers/database.mjs";
import roles from "../constants/roles.mjs";
import jwt from "jsonwebtoken";
import { librarianPassword } from "../helperFunctions/passGenerator.mjs";
import { keyVerifier, librarianKeys } from "../Keys/index.mjs";
import tokenVerifier from "../middleware/tokenVerifier.mjs";
const router = express.Router();
const salt = 10;
const secret = process.env.SECRET_JWT;


router.get("/all/:id", (req, res) => {
  try {
    const id = req.params.id;
    userCollection
      .findOne({ id: id })
      .then((e) => {
        if (e) {
          delete e.password
          res.status(200).json({message:"Ok",librarian:e})
          return
        } else {
          res.status(404).json({message:"Not found"})
          return
        }
      })
      .catch((err) => {
        res.status(500).json({ message: "Server error" });
        return
      });
  } catch {
    res.status(400).json({ messgae: "Bad request" });
    return
  }
});

router.use(tokenVerifier([roles.LA]))
router.post("/create", (req, res) => {
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



router.post("/update",(req,res)=>{
  try{
    const reqKeys = Object.keys(req.body)
    keyVerifier(reqKeys,librarianKeys)

  const body = req.body

  userCollection.findOne({id:body.id}).then((e)=>{
    delete body.assignedLibrary
    userCollection.updateOne(
      {id:body.id},
      {$set:body}
    ).then((resp)=>{
      res.status(200).json({message:"Librarian updated successfully"})
    })
  }).catch((err)=>{
    res.status(404).json({message:"Not found"})
  })
  }catch{
    res.status(400).status({message:"Bad request librarian update"})
  }
});

router.put("/remove/:id",(req,res)=>{
  try{
    const id = req.params.id;
    userCollection.findOne({id:id}).then((e)=>{
      libraryCollection.updateOne(
        {id:e.assignedLibrary},
        {$unset:{librarianAssigned: ""}}
      ).then((resp)=>{
        userCollection.deleteOne({id:id}).then((resp)=>{
          res.status(200).json({message:"Librarian removed"})
        })
      })
    }).catch((err)=>{
      res.status(404).json({message:"Librarian not found for removal"})
    })
  }catch{
    res.status(400).json({message:"Bad request librarian remove"})
  }
});




export default router;