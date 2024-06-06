import express from "express";
import { bookCollection, libraryCollection } from "../controllers/database.mjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/create", (req, res) => {
    try {
        const keys = [
            "ISBN",
            "yearPublished",
            "author",
            "publisher",
            "genre",
            "title",
            "nos_pages",
            "price",
            "libId",
            "id",
        ];
        const reqKeys = Object.keys(req.body);
        const body = req.body;
        keys.forEach((e) => {
            if (reqKeys.indexOf(e) == -1) {
                throw new Error();
            }
        });

        libraryCollection.findOne({
            $and: [
                { id: body.libID },
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
                    "ISBN":body.ISBN,
                    "yearPublished":body.yearPublished,
                    "author":body.author,
                    "publisher":body.publisher,
                    "genre":body.genre,
                    "title":body.title,
                    "nos_pages":body.nos_pages,
                    "price":body.price,
                    "libID":body.libID,
                    "id":body.id,
                }
                libraryCollection
                    .updateOne(
                        {id:body.libID},
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

export default router;