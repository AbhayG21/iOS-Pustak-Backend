import express from "express"
import jwt from "jsonwebtoken"
import bodyParser from "body-parser"
import superAdminDecoder from "./middleware/superAdminDecoder.mjs"
import tokenVerifier from "./middleware/tokenVerifier.mjs"
import roles from "./constants/roles.mjs"
import libAdminRoute from "./routes/libraryAdmin.mjs"
import librarianRoute from "./routes/librarian.mjs"
import libraryRoute from "./routes/library.mjs"
import bcrypt from "bcrypt"
import database from "./controllers/database.mjs"

const app = express();
const port = process.env.PORT || 8080;

const userCol = database.collection("Pustak");
app.use(bodyParser.json());

app.get("/super-admin",superAdminDecoder,(req,res)=>{
    const token = req.token;
    res.status(201).json({message:"Token:",token:token})
});

app.post("/auth/login",(req,res)=>{
    try{
    const email = req.body.email;
    const pass = req.body.pass;

    if(!email || !pass){
        throw new Error();
    }
    userCol.findOne({email:email}).then((e)=>{
        if(e){
            let hashPass = e.pass;
            let verifyPass = bcrypt.compareSync(pass,hashPass);

            if(verifyPass){
                let payLoad = {
                    email:email,
                    role:e.role
                };
                let secret = process.env.SECRET_JWT;
                let options = {expiresIn:"24h"};

                const token = jwt.sign(payLoad,secret,options);
                delete e.pass
                delete e._id
                res.status(200).json({ message: "OK", token: token, user: e });
            }else {
                res.status(400).json({ message: "Bad Request" });
              }
        }else {
            res.status(404).json({ message: "Not found" });
          }
    });
}catch{
    res.status(400).json({ message: "Bad Request" });
    }
})


app.use("/admin", tokenVerifier([roles.SA]));
app.use("/admin", libAdminRoute);

app.use("/library", tokenVerifier([roles.LA]));
app.use("/library", libraryRoute);

app.use("/librarian", tokenVerifier([roles.LA]));
app.use("/librarian", librarianRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});