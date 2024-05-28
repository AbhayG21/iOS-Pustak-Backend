const roles = require("../constants/roles")

async function fetchUser(userId)
{
    // TODO: Fetch the details of the user from user id
}

function userDecoder()
{
    return async (req,res,next)=>{

        // TODO: when connecting backend implementation
        
        // MARK: Simple static user for now
        const user = { name: "Abhay Gupta", role: roles.AD };
        req.user = user;
        next();
    }
}
module.exports = userDecoder()
