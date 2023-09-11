import mongoose from "mongoose";

const userSystemEnumValues = ["system", "user"];

const chatSchema = new mongoose.Schema({
  file_name: {
    type: String,
    required: true,
  },
  file_url: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  userId: {
    type: String,
    required: true,
  },
  file_key: {
    type: String,
    required: true,
  },
});

const userSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  stripeCustomerId: {
    type: String,
    required: true,
    unique: true,
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
  },
  stripePriceId: {
    type: String,
  },
  stripeCurrentPeriodEnd: {
    type: Date,
  },
});


const Chat = mongoose.models.chats || mongoose.model("chats", chatSchema);

export default Chat;
