import express from "express"
import cron from "node-cron"
import roles from "../constants/roles.mjs"
import tokenVerifier from "../middleware/tokenVerifier.mjs"
import { keyVerifier } from "../Keys/index.mjs"
import { finesCollection } from "../controllers/database.mjs"
const router = express.Router()


router.get("/user", tokenVerifier([roles.MB]), (req, res) => {
    try {
        const id = req.query.q
        if (!q) {
            throw new Error()
        }

        finesCollection
            .find({ userId: id })
            .toArray()
            .then((e) => {
                if (e) {
                    res.status(200).json({ message: "User fines fetched", fines: e })
                }
                else {
                    res.status(404).json({ message: "User Fine not found" })
                }
            })
            .catch((err) => {
                res.status(500).json({ message: "User fine server error" })
            })
    } catch {
        res.status(400).json({ message: "Bad request fine user" })
    }
})
router.use(tokenVerifier([roles.LB]))
router.post("/clear",tokenVerifier([roles.LB]),(req,res)=>{
    try{const requiredKeys = ["id"]
    const requestKeys = Object.keys(req.body)
    keyVerifier(requestKeys,requiredKeys)

    finesCollection
    .updateOne(
        {id:req.body.id},
        {$set:{finePaid:true}}
    ).then((e)=>{
        if(e.modifiedCount>0) {
            res.status(200).json({message:"Fine cleared"})
        }
    })}
    catch{
        res.status(400).json({message:"Bad request fine clear"})
    }
});

router.get("/all", (req, res) => {
    try {
        const id = req.query.q;

        if (!id) {
            throw new Error();
        }

        finesCollection
            .find({ libraryId: id })
            .toArray()
            .then((e) => {
                if (e) {
                    res.status(200).json({ message: "fine fetched", fines: e });
                } else {
                    res.status(404).json({ message: "Not found" });
                }
            })
            .catch((err) => {
                res.status(500).json({ message: "Server error" });
            });
    } catch (error) {
        res.status(400).json({ message: "Bad request" });
    }
});

export default router