import mongoose from "mongoose";
const userSystemEnumValues = ["system", "user"];

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  role: {
    type: String,
    enum: userSystemEnumValues,
    required: true,
  },
});

const Message =
  mongoose.models.messages || mongoose.model("messages", messageSchema);

export default Message;
