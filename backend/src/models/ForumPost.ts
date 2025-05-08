import { Schema, model } from "mongoose";

const forumPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comments: [{
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }],
    analysisId: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

export default model("ForumPost", forumPostSchema); 