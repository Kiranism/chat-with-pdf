import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { connect } from "@/db/dbConfig";
import Chat from "@/db/models/chatModel";
// import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
// import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

connect();

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await Chat.find({ userId: userId }).lean();
  console.log("_chats:=>", _chats);

  if (!_chats) {
    return redirect("/");
  }
  // @ts-ignore
  const chatsWithIdAsString = _chats.map((chat) => ({
    ...chat,
    _id: chat._id?.toString(),
  }));

  // if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
  //   return redirect("/");
  // }

  const currentChat = chatsWithIdAsString.find((chat) => chat._id === chatId);

  console.log("currentChat", currentChat);
  // const isPro = await checkSubscription();

  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs">
          // @ts-ignore
          <ChatSideBar chats={chatsWithIdAsString} chatId={chatId} />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
          // @ts-ignore
          <PDFViewer file_url={currentChat?.file_url || ""} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={chatId} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
