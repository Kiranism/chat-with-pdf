import { connect } from "@/db/dbConfig";
import { NextResponse } from "next/server";
connect();
export async function GET(req: Request, res: Response) {
  return NextResponse.json({ message: "hello world!" });
}
