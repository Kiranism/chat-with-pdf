import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { utapi } from "uploadthing/server";
import { UserButton, auth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import Link from "next/link";
import Random from "@/components/Random";
export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-yellow-400 via-gray-50 to-teal-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold ">Chat With PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-2">
            {isAuth && <Button>Go to Chats</Button>}
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
