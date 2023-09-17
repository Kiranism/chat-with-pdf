import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { UserButton, auth } from "@clerk/nextjs";
import { ArrowRight, LogIn } from "lucide-react";
import Balancer from "react-wrap-balancer";
import Link from "next/link";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Image from "next/image";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  let firstChat;
  if (userId) {
    firstChat = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.createdAt));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }

  return (
    <div className="w-screen min-h-[100dvh] bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex min-w-72 max-w-xl flex-col items-center text-center">
          <div className="flex w-full justify-center items-center">
            <h1 className="text-4xl whitespace-nowrap md:text-5xl font-semibold">
              Chat With PDF
            </h1>
            <span className="ml-3">
              <UserButton afterSignOutUrl="/" />
            </span>
          </div>
          <div className="flex justify-center w-full mt-2">
            {isAuth && firstChat && (
              <Link href={`/chat/${firstChat.id}`}>
                <Button>
                  Go to Chats <ArrowRight className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
          <p className="mt-1 w-full text-lg text-slate-600">
            <Balancer>
              Chat with any PDF. Join millions of students, researchers and
              professionals to instantly answer questions and understand
              research with AI.
            </Balancer>
          </p>
          <div className="w-full mt-4">
            {isAuth ? (
              <>
                <FileUpload />
              </>
            ) : (
              <>
                <Link href={"/sign-in"}>
                  <Button>
                    Login to get Started
                    <LogIn className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <div className="p-2 mt-6 shadow-xl bg-gray-900/5 rounded-xl ring-1 ring-gray-900/10">
                  <Image
                    src={"/landing.png"}
                    alt="Landing Image"
                    loading="lazy"
                    width="1200"
                    height="1200"
                    decoding="async"
                    className="shadow-xl rounded-xl ring-gray-900/10 ring-1"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
