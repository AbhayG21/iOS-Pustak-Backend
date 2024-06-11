import express from "express";
import {libraryCollection,finesCollection,issuesCollection } from "../controllers/database.mjs";
import tokenVerifier from "../middleware/tokenVerifier.mjs";
import roles from "../constants/roles.mjs";
import jwt from "jsonwebtoken";
import { bookKeys, keyVerifier } from "../Keys/index.mjs";
const router = express.Router();



router.get("/all/:id", (req, res) => {
    try {
      const id = req.params.id;
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


router.use(tokenVerifier([roles.LA,roles.LB]))
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

router.post("/remove",(req,res)=>{
    try{
        const reqKeys = Object.keys(req.body)
        keyVerifier(reqKeys,bookKeys)
        const body = req.body
        
        libraryCollection.findOne({id:body.libraryId}).then((e)=>{
            libraryCollection.updateOne({id:body.libraryId},
                {
                    $pull: {books:{id: body.id}}
                }
            ).then((resp)=>{
                res.status(200).json({message:"Book removed successfully"})
            })
        }).catch((err)=>{
            res.status(404).json({message:"Not found"})
        })

    }catch{
        res.status(400).json({message:"Bad request"})
    }
});

router.get("/detail",(req,res)=>{
    try {
        const id = req.query.id;
        const libraryId = req.query.libraryId

        if(!id || !libraryId){
            throw new Error()
        }
        libraryCollection.aggregate([
            {$match:{id:libraryId}},
            {$unwind: "$books"},
            {$match:{"books.id":id}},
            {$project:{_id:0,books:"$books"}},
        ])
        .toArray()
        .then((e)=>{
            console.log(e[0])
            res.status(200).json({message:"Book detail successfull",book:e[0].books})
        })
        .catch((err)=>{
            res.status(404).json({message:"Not found"})
        })
    } catch {
        res.status(400).json({message:"Bad request bookDetail"})
    }
})

export default router;