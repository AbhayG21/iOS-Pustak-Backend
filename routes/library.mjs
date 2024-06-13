import express from "express";
import jwt from "jsonwebtoken";
import { libraryCollection, userCollection } from "../controllers/database.mjs";
import { keyVerifier, libraryKeys } from "../Keys/index.mjs";
import roles from "../constants/roles.mjs";
import tokenVerifier from "../middleware/tokenVerifier.mjs"

const router = express.Router();
const secret = process.env.SECRET_JWT;


router.get("/domain", (req, res) => {
  try {
    let id = req.query.q;
    if (!id) {
      throw new Error();
    } else {
      libraryCollection
        .find({ domain: id })
        .toArray()
        .then((e) => {
          if (e) {
            res.status(200).json({ message: "Domain libraries fetched", libraries: e });
          } else {
            res.status(404).json({ message: "Not found" });
          }
        })
        .catch((err) => {
          res.status(500).json({ message: "Server error" });
        });
    }
  } catch {
    res.status(400).json({ message: "Bad request" });
  }
});

router.get("/:id", (req, res) => {
  try {
    const id = req.params.id;
    libraryCollection
      .findOne({ librarianAssigned: id })
      .then((e) => {
        if (e) {
          res.status(200).json({ message: "OK", library: e });
        } else {
          res.status(404).json({ message: "Not found" });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: "Server error" });
      });
  } catch {
    res.status(400).json({ messgae: "Bad request" });
  }
});
router.use(tokenVerifier([roles.LA]))

router.post("/create", (req, res) => {
  try {
    const keys = ["id", "libraryName", "libraryContact", "email", "address", "books", "libraryAdmin"];
    const reqKeys = Object.keys(req.body);
    keys.forEach((e) => {
      if (reqKeys.indexOf(e) == -1) {
        throw new Error();
      }
    });

    const token = req.token;
    const tokenPayload = jwt.verify(token, secret);

    const adminEmail = tokenPayload.email;
    libraryCollection.findOne({ email: req.body.email }).then((e) => {
      if (e) res.status(400).json({ message: "Duplicate entry found" });
      else {
        const body = req.body;
        const payLoad = {
          ...body
        }
        libraryCollection
          .insertOne(payLoad)
          .then((e) => {
            userCollection.updateOne(
              { id: tokenPayload.id },
              { $push: { libraries: payLoad.id } }
            ).catch((error) => {
            })
            res.status(201).json({ message: "Library created" });
          })
          .catch((err) => {
            res.status(400).json({ message: "Something went wrong" });
          });
      }
    });
  } catch {
    res.status(400).json({ message: "Bad request lib" });
  }
});

router.get("/", (req, res) => {
  try {
    let id = req.query.id;
    libraryCollection
      .find({ libraryAdmin: id })
      .toArray()
      .then((e) => {
        userCollection
          .find({ admin: id })
          .toArray()
          .then((resp) => {
            res
              .status(200)
              .json({ message: "OK", libraries: e, librarians: resp });
          });
      })
      .catch((err) => {
        res.status(404).json({ message: "Not found" });
      });
  } catch {
    res.status(400).json({ message: "Bad Request" });
  }
});


router.post("/delete", (req, res) => {
  try {
    const requiredKeys = ["libraryId", "librarianId"]
    const requestKeys = Object.keys(req.body)

    keyVerifier(requestKeys, requiredKeys)
    const body = req.body

    libraryCollection.findOneAndDelete({ id: body.libraryId })
      .then((e) => {
        userCollection.deleteOne({ id: body.librarianId })
          .then(() => {
            userCollection.updateMany(
              { selectedLibrary: body.libraryId },
              { $unset: { selectedLibrary: "" } }
            )
              .then(() => {
                userCollection.updateMany(
                  {},
                  {
                    $pull: {
                      libraries: body.libraryId,
                      librarians: body.librarianId
                    }
                  }
                )
                  .then(() => {
                    res.status(200).json({ message: "Library deleted successfully" });
                  });
              });
          });
      })
      .catch((err) => {
        res.status(500).json({ message: "Server error while deleting library" });
      });
  } catch {
    res.status(400).json({message:"Bad request library deletion"})
  }
})
router.post("/update", (req, res) => {
  try {
    const reqKeys = Object.keys(req.body)
    keyVerifier(reqKeys, libraryKeys)
    const body = req.body

    libraryCollection.findOne({ id: body.id }).then((e) => {
      if (e) {
        delete body.books
        libraryCollection.updateOne(
          { id: body.id },
          {
            $set: body
          }
        ).then((e) => {
          res.status(200).json({ message: "Library details updated" })
        })
      }
      else {
        res.status(404).status({ message: "Not found" })
      }
    }).catch((err) => {
      res.status(500).status({ message: "server error library update" })
    })

  } catch {
    res.status(500).status({ message: "Server Error" })
  }
})



export default router;