import { connect } from "@/db/dbConfig";
import Message from "@/db/models/messageModel";
import { NextResponse } from "next/server";

connect();
export const POST = async (req: Request) => {
  const { chatId } = await req.json();
  const _messages = await Message.find({ chatId });
  console.log("yo messages=>", _messages);
  return NextResponse.json(_messages);
};
