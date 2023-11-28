
import mongoose from "mongoose";

//Schema for Thread
const ThreadSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId: {
        type: String
    },
    children: [
        {
            // this mean that one Thread can have multiple threads as children
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread"
        }
    ]
})

const Thread = mongoose.models.Thread || mongoose.model('Thread', ThreadSchema);
export default Thread;
