import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { utapi } from "uploadthing/server";
import { UserButton, auth } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import Link from "next/link";
export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const pdfFile = await utapi.getFileUrls(
    "b3e6f9db-6835-49ef-b2b4-7d9d387ced91_Kiran S - FE.pdf"
  );
  console.log("pdf=>", pdfFile);
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-blue-300 via-green-200 to-yellow-300">
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
