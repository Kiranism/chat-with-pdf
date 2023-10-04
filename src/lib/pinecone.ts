import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { downloadFromURL } from "./downloadFile";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";
import { embeddingTransformer } from "./transformers";
// import { embeddingTransformer } from "./transformers";

export const getPineconeClient = () => {
  return new Pinecone({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadPdfIntoPinecone(file_key: string, file_url: string) {
  console.log("downloading file from uploadthing into filesystem");
  const file_name = await downloadFromURL(file_url);
  if (!file_name) {
    throw new Error("could not download from uploadthing");
  }
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];
  console.log("pagees=>", pages);
  // split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDoc));
  console.log("documents", documents);
  const fileKeyWithoutAsci = convertToAscii(file_key);
  // vectorise and embed individual docs
  const vectors = await Promise.all(
    documents.flat().map((doc) => embedDocument(doc, fileKeyWithoutAsci))
  );
  console.log("vectors", vectors);

  // upload the vector to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = client.Index("chat-with-pdf");
  const namespace = pineconeIndex.namespace(convertToAscii(file_key));
  console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);
  return documents[0];
}

async function embedDocument(doc: Document, file_key: string) {
  try {
    const embeddings = await embeddingTransformer(doc.pageContent);
    console.log("embeddings=>", embeddings);
    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        fileKey: file_key,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDoc(page: PDFPage) {
  let { metadata, pageContent } = page;
  pageContent = pageContent.replace(/\n/g, "");
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
