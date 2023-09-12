import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse, Message } from "ai";
import { getContext } from "@/lib/context";
import { connect } from "@/db/dbConfig";
import Chat from "@/db/models/chatModel";
import { NextResponse } from "next/server";
import _message from "@/db/models/messageModel";
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);
connect();
export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const _chat = await Chat.findById({ _id: chatId });
    console.log("chat from api chat", _chat);
    if (!_chat) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }

    const fileKey = _chat.file_key;
    const context = await getContext(lastMessage.content, fileKey);

    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
        AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
        AI assistant is a big fan of Pinecone and Vercel.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
        AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
        AI assistant will not invent anything that is not drawn directly from the context.
        `,
    };

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      stream: true,
    });
    const stream = OpenAIStream(response, {
      onStart: async () => {
        //save user message into db
        const data = {
          chatId: chatId,
          content: lastMessage.content,
          role: "user",
        };
        await _message.create(data);
      },
      onCompletion: async (completion) => {
        const data = {
          chatId: chatId,
          content: completion,
          role: "system",
        };
        await _message.create(data);
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log("some error happended in chatCompletion", error);
  }
}
