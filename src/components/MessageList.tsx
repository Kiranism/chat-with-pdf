import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import React, { RefObject } from "react";

type Props = {
  isLoading: boolean;
  messages: Message[];
  messageRef: RefObject<HTMLDivElement>;
};

const MessageList = ({ messages, isLoading, messageRef }: Props) => {
  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!messages) return <></>;
  return (
    <div
      ref={messageRef}
      className="flex flex-col gap-2 px-4 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-300 max-h-[80vh] md:max-h-[85vh]"
    >
      {messages.length > 0 &&
        messages.map((message) => {
          return (
            <div
              key={message.id}
              className={cn("flex", {
                "justify-end pl-10": message.role === "user",
                "justify-start pr-10": message.role === "assistant",
              })}
            >
              <div
                className={cn(
                  "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10",
                  {
                    "bg-blue-600 text-white": message.role === "user",
                  }
                )}
              >
                <p>{message.content}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MessageList;
