const jwt = require("jsonwebtoken");

const tokenVerifirer = (roles) => {
  return (req, res, next) => {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const payload = jwt.verify(token, process.env.SECRET_JWT);

      const role = payload.role;

      if (roles.indexOf(role) == -1) {
        res.status(403).json({ message: "Not Authorized" });
      }

      next();
    } catch {
      res.status(401).json({ message: "Something Broke" });
    }
  };
};

module.exports =  tokenVerifirer ;
