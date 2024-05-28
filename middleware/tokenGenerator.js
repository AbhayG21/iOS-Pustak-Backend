const jwt = require("jsonwebtoken")

function generateToken() {
    return (req,res,next)=>{
        const secret = process.env.SECRET_JWT
        const user = req.user
        const options = {expiresIn:"120h"}

        const token = jwt.sign(secret,user.options);
        req.token = token
        next();
    }
}
module.exports = generateToken()