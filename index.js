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
import issueRoute from "./routes/issue.mjs"
import fineRoute from "./routes/fine.mjs"
import bcrypt, { hash } from "bcrypt"
import database from "./controllers/database.mjs"
import { userCollection } from "./controllers/database.mjs"
import cron from "node-cron"
import { addFine } from "./schedulers/fine.mjs"
const app = express();
const port = process.env.PORT
const salt = 10
app.use(bodyParser.json());


app.get("/user/:id", tokenVerifier([roles.LA, roles.LB, roles.MB]), (req, res) => {
  try {
    const id = req.params.id
    if (!id) {
      throw new Error()
    }
    userCollection
      .findOne({ id: id })
      .then((e) => {
        delete e.password
        delete e._id
        res.status(200).json({ message: "Profile fetched", role: e.role, user: e });
      })
      .catch((err) => {
        res.status(404).json({ message: "Not found" })
      })

  } catch {
    res.status(400).json({ message: "Bad request profile" })
  }
})
app.get("/super-admin", superAdminDecoder, (req, res) => {
  const token = req.token;
  res.status(201).json({ message: "Token:", token: token })
});

app.post("/auth/login", (req, res) => {
  try {
    const email = req.body.email;
    const pass = req.body.password;

    if (!email || !pass) {
      throw new Error();
    }

    userCollection.findOne({ email: email }).then((e) => {
      if (e) {
        let hashPass = e.password;
        let verifyPass = bcrypt.compareSync(pass, hashPass);
        if (verifyPass) {
          let payLoad = {
            id: e.id,
            role: e.role
          };
          let secret = process.env.SECRET_JWT;
          let options = { expiresIn: "24h" };

          const token = jwt.sign(payLoad, secret, options);

          delete e.password
          delete e._id
          res.status(200).json({ message: "OK", role: e.role, token: token, user: e, id: e.id });
        } else {
          res.status(400).json({ message: "Bad Request index" });
        }
      } else {
        res.status(404).json({ message: "Not found" });
      }
    });
  } catch {
    res.status(400).json({ message: "Bad Request index2" });
  }
})

app.post("/verify", (req, res) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    const secret = process.env.SECRET_JWT;
    const tokenPayload = jwt.verify(token, secret);
    if (tokenPayload) {

      userCollection.findOne({ id: tokenPayload.id }).then((e) => {
        if (e) {
          res.status(200).json({ message: "OK" });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      });
    } else {
      res.status(401).json({ message: "Please login again" });
    }
  } catch {
    res.status(400).json({ message: "Bad Request" });
  }
});

app.post("/auth/signup", (req, res) => {
  try {
    const keys = [
      "user",
      "password"
    ]
    const keyBody = Object.keys(req.body);
    keys.forEach((e) => {
      if (keyBody.indexOf(e) == -1) {
        throw new Error();
      }
    })

    const body = req.body
    const user = body.user
    const password = body.password
    bcrypt.hash(password, salt).then((hashPass) => {
      userCollection.findOne({ id: user.id }).then((e) => {
        if (e) {
          res.status(409).json({ message: "Email already exists" })
        }
        else {
          const payload = {
            ...user,
            password: hashPass
          };

          let tokenPayload = {
            email: user.id,
            role: roles.MB,
          };
          const secret = process.env.SECRET_JWT
          const options = { expiresIn: "24h" }
          const token = jwt.sign(tokenPayload, secret, options)

          userCollection.insertOne(payload).then((e) => {
            res.status(201).json({
              message: "member created",
              token: token,
              role: roles.MB,
              user: user,
              id: user.id
            })
          })
            .catch((error) => {
              res.status(500).json({ message: "Bad request member" })
            })
        }
      })
    })
  } catch {
    res.status(400).json({ message: "Bad request member 2" })
  }
});

app.use("/library-admin", tokenVerifier([roles.SA]));
app.use("/library-admin", libAdminRoute);

app.use("/library", libraryRoute);

app.use("/librarian", librarianRoute);

app.use("/book", bookRoute);

app.use("/issue", issueRoute)

app.use("/fine", fineRoute)

cron.schedule("0 0 * * *", addFine)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

