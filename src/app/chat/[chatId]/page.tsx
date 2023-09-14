import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import { PanelRightOpen } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import PDFViewer from "@/components/PDFViewer";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
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

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  // if (!_chats.find((chat) => chat._id === chatId)) {
  //   return redirect("/");
  // }

  return (
    <div className="flex max-h-[100dvh]">
      <div className="flex relative flex-col md:!flex-row w-full max-h-[100dvh] min-h-[100dvh] overflow-hidden">
        {/* chat sidebar */}
        <div className="hidden md:!flex max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>

        <div className="m-2 flex md:!hidden gap-2 items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="flex h-9 lg:hidden"
                aria-label="Open right panel"
              >
                <PanelRightOpen size={20} />
              </Button>
            </SheetTrigger>

            <SheetContent side={"left"} className="w-[17rem] p-0">
              <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
            </SheetContent>
          </Sheet>
          <div>
            <h3 className="text-base font-bold">Chat</h3>
            <p className="text-xs text-slate-600 truncate text-ellipsis">
              {currentChat?.pdfName}
            </p>
          </div>
        </div>

        {/* pdf viewer */}
        <div className="max-h-[100dvh] p-4 hidden md:!flex oveflow-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-300 flex-[5]">
          <PDFViewer file_url={currentChat?.pdfUrl || ""} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
