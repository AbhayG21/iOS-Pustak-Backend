import express from "express"

import tokenVerifier from "../middleware/tokenVerifier.mjs"
import roles from "../constants/roles.mjs"
import { keyVerifier } from "../Keys/index.mjs"
import { userCollection, wishlistCollection } from "../controllers/database.mjs"
const router = express.Router()

router.use(tokenVerifier([roles.MB]))

router.post("/set-library", (req, res) => {
    try {
        const requiredKeys = ["userId", "libraryId"]
        const requestKeys = Object.keys(req.body)

        keyVerifier(requestKeys, requiredKeys)

        userCollection.updateOne(
            { id: req.body.userId },
            { $set: { selectedLibrary: req.body.libraryId } }
        )
            .then((e) => {
                if (e.modifiedCount > 0) {
                    res.status(200).json({ message: "Library set" })
                }
                else res.status(404).json({ message: "library set not found" })
            })
            .catch((err) => {
                res.status(500).json({ message: "Server error while setting library" })
            })
    } catch (error) {
        res.status(400).json({ message: "Bad request set library" })
    }
});

router.get("/wishlist", (req, res) => {
    try {
        const id = req.query.q
        const libId = req.query.p
        if (!id) {
            throw new Error()
        }

        wishlistCollection
            .find(
                { $and: [{ userId: id }, { libraryId: libId }] }
            )
            .project({ "book.$": 1 })
            .toArray()
            .then((e) => {
                if (e) {
                    const books = e.map(item => item.book)
                    res.status(200).json({ message: "Wishlist fetched", wishlist: books })
                }
                else res.status(404).json({ message: "Wishlist not found" });
            })
            .catch((err) => {
                res.status(500).json({ message: "Server error while fetching wishlist" })
            })
    } catch (error) {
        res.status(400).json({ message: "Bad request wishlist get" })
    }
})

router.post("/wishlist-add", (req, res) => {
    try {
        const requiredKeys = ["book", "userId", "libraryId"];
        const requestKeys = Object.keys(req.body)
        keyVerifier(requestKeys, requiredKeys)
        wishlistCollection.insertOne({
            ...req.body
        })
            .then((e) => {
                res.status(200).json({ message: "Added to wishlist" })
            }).catch((err) => {
                res.status(500).json({ message: "Server error while setting wishlist" });
            })

    } catch (error) {
        res.status(400).json({ message: "Bad request set wishlist" })
    }
})

router.post("wishlist-remove", (req, res) => {
    try {
        const requiredKeys = ["book", "userId", "libraryId"];
        const requestKeys = Object.keys(req.body)
        keyVerifier(requestKeys, requiredKeys)
        wishlistCollection
            .findOne(
            {$and:[{libraryId:libraryId},{userId:userId}]}
        )
    } catch (error) {
        
    }
})
export default router