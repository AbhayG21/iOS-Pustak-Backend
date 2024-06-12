import { issuesCollection } from "../controllers/database.mjs"
import { v4 as uuidv4 } from "uuid"
export const addFine = async () => {
    try {
        const overDueIssue = await issuesCollection
            .find({
                endDate: { $lt: Math.ceil(Date.now() / 1000) },
                returned: false,
            })
            .toArray()


        const finesToInsert = overDueIssue.map((e) => {
            const dueDate = new Date(e.endDate * 1000)
            const daysOverDue = Math.ceil((Date.now() - dueDate) / (1000 * 60 * 60 * 24));
            return {
                id: uuidv4(),
                userId: e.userId,
                bookId: e.bookId,
                finePaid: false,
                amount: daysOverDue * 10,
                libraryId: e.libraryId
            }
        })
    } catch {
        console.log("some error occured")
    }
}