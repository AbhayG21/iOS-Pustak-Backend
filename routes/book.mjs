import express from "express";
import { bookCollection, libraryCollection } from "../controllers/database.mjs";
import jwt from "jsonwebtoken";
import { bookKeys } from "../Keys/index.mjs";
const router = express.Router();

router.post("/create", (req, res) => {
    try {
        const reqKeys = Object.keys(req.body);
        const body = req.body;
        bookKeys.forEach((e) => {
            if (reqKeys.indexOf(e) == -1) {
                throw new Error();
            }
        });

        libraryCollection.findOne({
            $and: [
                { id: body.libraryId },
                {
                    books: {
                        $elemMatch: {
                            ISBN: req.body.ISBN,
                        },
                    },
                },
            ]
        }).then((e) => {
            if (e) res.status(400).json({ message: "Book already exists" });
            else {
                let payload = {
                    ...body
                }
                libraryCollection
                    .updateOne(
                        {id:body.libraryId},
                        {
                            $push:{books:payload}
                        }
                    )
                    .then((e) => {
                        
                        res.status(201).json({ message: "Book added" });
                    })
                    .catch((err) => {
                        res.status(500).json({ message: "Error occured" });
                    });
            }
        });
    } catch {
        res.status(400).json({ message: "Bad request book" });
    }
});

router.post("/update",(req,res)=>{
    try{
        const reqKeys = Object.keys(req.body)
        const body = req.body
        bookKeys.forEach((e) => {
            if (reqKeys.indexOf(e) == -1) {
                throw new Error();
            }
        });
        libraryCollection.findOne({id:body.libraryId}).then((e)=>{
            if(e){
            libraryCollection.updateOne(
                {$and: [{id:body.libraryId},{"books.id":body.id}]},
                {$set:{"books.$":body}}
            )
            res.status(200).json({message:"Book updated"})
        }else{
            res.status(404).json({message:"Not found"})
        }
    })
}catch{
    res.status(400).json({message:"Bad request"})
}
});

router.get("/:id", (req, res) => {
    try {
      const id = req.params.id;
      console.log(id)
      libraryCollection
        .findOne({ id: id })
        .then((e) => {
          if (e) {
            res.status(200).json({ message: "OK", books: e.books });
          } else {
            res.status(404).json({ message: "Not found" });
          }
        })
        .catch((err) => {
          res.status(500).json({ message: "Server error" });
        });
    } catch {
      res.status(400).json({ message: "Bad request" });
    }
  });

export default router;