import express from "express";
import bcrypt from "bcrypt";
import { userCollection } from "../controllers/database.mjs";
import roles from "../constants/roles.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const salt = 10;
const secret = process.env.SECRET_JWT;


router.post("/create", (req, res) => {
    try {
        const keys = ["id","email","name","phone","library","password"]
        const keyBody = Object.keys(req.body);
        keys.forEach((e)=>{
            if(keyBody.indexOf(e) == -1){
                    throw new Error();
            }
        })

        const body = req.body
        bcrypt.hash(body.password, salt).then((e) => {
            const token = req.token;
            const tokenPayLoad = jwt.verify(token, secret);
            const payLoad = {
                id: body.id,
                email: body.email,
                name: body.name,
                phone: body.phone,
                library: body.library,
                password: e,
                role: roles.LB,
                admin: tokenPayLoad.email
            };

            userCollection.findOne({ email: body.email }).then((e) => {
                if (e) { res.status(400).json({ message: "email already exists" }); }
                else{
                    userCollection.insertOne(payLoad).then((e)=>{
                        userCollection.updateOne(
                            {email:tokenPayLoad.email},
                            {$push:{librarians:payLoad}}
                        )
                        res.status(401).json({message:"librarian added"})
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

export default router;