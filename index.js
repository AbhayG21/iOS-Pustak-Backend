const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const userDecoder = require("./middleware/userDecoder");
const tokenGenerator = require("./middleware/tokenGenerator");
const roles = require("./constants/roles");
const verifier = require("./middleware/tokenVerifier");
const bodyParser = require("body-parser");
const superAdminDecoder = require("./middleware/superAdminDecoder");
const secret = process.env.SECRET_JWT;
const port = process.env.PORT;
const adminRoute = require("./routes/admin")
app.use(bodyParser.json())

app.get("/generateSA",superAdminDecoder,(req,res)=>{
    const token = req.token;
    res.status(200).json({message:"Token generated successfully",token:token})
});

app.use("/admin",verifier([roles.SA]))
app.use("/admin",adminRoute)

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });