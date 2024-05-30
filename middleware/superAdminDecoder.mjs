import roles from "../constants/roles.mjs";
import jwt from "jsonwebtoken"
function superAdminDecoder()
{
    return (req,res,next)=>{
        const id = process.env.SA_ID;
        const reqId = req.query.id;

        if (id == reqId)
        {
            console.log("yessss")
            const payLoad = {name:"Abhay Gupta",role:roles.SA};
            const options = {expiresIn:"1h"};
            const secret = process.env.SECRET_JWT
            const token = jwt.sign(payLoad,secret,options);
            req.token = token;
            next();
        }
        else
        {
            res.status(403).json({message:"Not Authorised"});
        }
    }
}
export default superAdminDecoder()