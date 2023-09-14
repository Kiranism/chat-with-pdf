import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadPdfIntoPinecone } from "@/lib/pinecone";
// import { loadS3IntoPinecone } from "@/lib/pinecone";
// import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { utapi } from "uploadthing/server";

// /api/create-chat
export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  console.log("userID from server", userId);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log(file_key, file_name);
    const pdf = await utapi.getFileUrls(file_key);
    console.log("pdf from server==>", pdf);
    const file_url = pdf[0].url;
    let doc = await loadPdfIntoPinecone(file_key, file_url);
    console.log("doc===>", doc);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: file_url,
        userId,
      })
      .returning({
        insertedId: chats?.id,
      });
    console.log("chat==?", chat_id);
    return NextResponse.json(
      {
        chat_id: chat_id[0]?.insertedId,
        file_name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error", msg: error },
      { status: 500 }
    );
  }
}
