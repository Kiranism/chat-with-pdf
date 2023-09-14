import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { utapi } from "uploadthing/server";
import { UserButton, auth } from "@clerk/nextjs";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import Random from "@/components/Random";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  // let firstChat;
  // if (userId) {
  //   firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
  //   if (firstChat) {
  //     firstChat = firstChat[0];
  //   }
  // }

  return (
    <div className="w-screen min-h-[100dvh] bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-4xl md:text-5xl font-semibold ">
              Chat With PDF
            </h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-2">
            {/* {isAuth && firstChat && (
              <Link href={`/chat/${firstChat.id}`}>
                <Button>
                  Go to Chats <ArrowRight className="ml-2" />
                </Button>
              </Link>
            )} */}
          </div>
          <p className="max-w-xl mt-1 text-slg text-slate-600">
            Chat with any PDF. Join millions of students, researchers and
            professionals to instantly answer questions and understand research
            with AI.
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
              <>
                <FileUpload />
              </>
            ) : (
              <Link href={"/sign-in"}>
                <Button>
                  Login to get Started
                  <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
