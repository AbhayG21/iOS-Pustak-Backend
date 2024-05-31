import express from "express"
import jwt from "jsonwebtoken"
import bodyParser from "body-parser"
import superAdminDecoder from "./middleware/superAdminDecoder.mjs"
import tokenVerifier from "./middleware/tokenVerifier.mjs"
import roles from "./constants/roles.mjs"
import libAdminRoute from "./routes/libraryAdmin.mjs"
import librarianRoute from "./routes/librarian.mjs"
import libraryRoute from "./routes/library.mjs"
import bookRoute from "./routes/book.mjs"
import bcrypt from "bcrypt"
import database from "./controllers/database.mjs"
import { userCollection } from "./controllers/database.mjs"

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.get("/super-admin",superAdminDecoder,(req,res)=>{
    const token = req.token;
    res.status(201).json({message:"Token:",token:token})
});

app.post("/auth/login",(req,res)=>{
    try{
    const email = req.body.email;
    const pass = req.body.password;

    if(!email || !pass){
        throw new Error();
    }
    userCollection.findOne({email:email}).then((e)=>{
        if(e){
            let hashPass = e.password;
            let verifyPass = bcrypt.compareSync(pass,hashPass);
            console.log(pass,hashPass)
            if(verifyPass){
                let payLoad = {
                    email:email,
                    role:e.role
                };
                console.log(payLoad)
                let secret = process.env.SECRET_JWT;
                let options = {expiresIn:"24h"};

                const token = jwt.sign(payLoad,secret,options);
                delete e.password
                delete e._id
                res.status(200).json({ message: "OK", token: token, user: e });
            }else {
                res.status(400).json({ message: "Bad Request index" });
              }
        }else {
            res.status(404).json({ message: "Not found" });
        }
    });
}catch{
    res.status(400).json({ message: "Bad Request index2" });
    }
})


app.use("/library-admin", tokenVerifier([roles.SA]));
app.use("/library-admin", libAdminRoute);

app.use("/library", tokenVerifier([roles.LA]));
app.use("/library", libraryRoute);

app.use("/librarian", tokenVerifier([roles.LA]));
app.use("/librarian", librarianRoute);

app.use("/book", tokenVerifier([roles.LB]));
app.use("/book", bookRoute);

// app.use("/member")
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});