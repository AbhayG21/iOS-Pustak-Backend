import express from "express"
import { issuesCollection } from "../controllers/database.mjs"
import { keyVerifier } from "../Keys/index.mjs"
import tokenVerifier from "../middleware/tokenVerifier.mjs"
import roles from "../constants/roles.mjs"

const router = express.Router();
router.post("/create",tokenVerifier([roles.MB]),(req,res)=>{
    try {
        const requiredKeys = [
            "id",
            "bookId",
            "startDate",
            "endDate",
            "userId",
            "approved",
            "libraryId"
        ]
        const requestKeys = Object.keys(req.body)
        keyVerifier(requestKeys,requiredKeys)

        const body = req.body
        let payLoad = [
            ...body
        ]

        issuesCollection.insertOne(payLoad).then((e)=>{
            libraryCollection.updateOne(
                {
                    id:body.libraryId,
                    "books.id":body.bookId
                },
                {
                    $inc:{
                        "books.$.qty":-1,
                    }
                }
            ).then((e)=>{
                res.status(200).json({message:"Quantity updated",issue:body})
            })
        }).catch((err)=>{
            res.status(500).json({message:"Server error"})
        })
    } catch (error) {
        res.status(400).json({message:"Bad request"})
    }
})

router.get("/member",tokenVerifier([roles.MB]),(req,res)=>{
    try{
        const uId = req.query.q
        if(!uId){
            throw new Error()
        }

        issuesCollection.find({userId:userId}).toArray().then((e)=>{
            if(e){
                res.status(200).json({ message: "Member issues fetched", issues: e });
            }
            else{
                res.status(404).json({ message:"User Not found" });
            }
        })

    }catch{
        res.status(400).json({message:"Bad request member issue"})
    }
})
router.get("/all",tokenVerifier([roles.LB]),(req,res)=>{
    try{
        const issueId = req.query.q;
        if(!issueId)
        {
            throw new Error()
        }

        issuesCollection
        .find({libraryId:libraryId})
        .toArray()
        .then((e)=>{
            if(e){
                res.status(200).json({message:"Issues fetched",issues:e})
            }
            else{
                res.status(404).json({ message: "issue not found" });
            }
        })
    }
    catch{
        res.status(400).json({ message: "Bad request issue all" });
    }
})
router.post("/action",tokenVerifier([roles.LB]),(req,res)=>{
    try {
        const requiredKeys = ["id","accepted"]
        const requestKeys = Object.body(req.body)
        keyVerifier(requestKeys,requiredKeys)

        issuesCollection.updateOne(
            {id:req.body.id},
            {$set:{approved:req.body.approved}}
        )
        .then((e)=>{
            res.status(200).json({message:"issue action successful"})
        })
        .catch((err)=>{
            res.status(500).json({message:"Server error"})
        })
    } catch (error) {
        res.status(400).json({message:"Bad request issue approve"})
    }
})

router.post("/cancel",tokenVerifier([roles.MB]),(req,res)=>{
    try{
        const requiredKeys = ["id"]
        const requestKeys = Object.keys(req.body);

        keyVerifier(requestKeys,requiredKeys)
        const id = req.body.id

        issuesCollection.deleteOne({id:id})
        .then((e)=>{
            res.status(200).json({message:"Issue deletion successfull"})
        })
        .catch((err)=>{
            res.status(500).json({ message: "Server error" });
        })
    }catch{
        res.status(400).json({message:"Bad request issue cancel"})
    }
})
router.post("/return",tokenVerifier([roles.LB]),(req,res)=>{
    try {
        const id = req.body.id
        if(!id){
            throw new Error()
        }
        issuesCollection.updateOne(
            {id:id},
            {
                $set:{returned:true}
            }
        ).then((e)=>{
            if(e.modifiedCount>0){
                res.status(200).json({message:"Issue returned"})
            }
        })
    } catch (error) {
        res.status(400).json({message:"Bad request issue return"})
    }
})
export default router;