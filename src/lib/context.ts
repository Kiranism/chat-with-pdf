import { PineconeClient } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";
import { embeddingTransformer } from "./transformers";
// import { embeddingTransformer } from "./transformers";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  });
  const index = await pinecone.Index("chat-with-pdf");
  try {
    const fileKeyWithoutAsci = convertToAscii(fileKey);
    // const namespace = index.namespace(namespaceWithoutAscii);
    const namespace = convertToAscii(fileKey);
    const filter = { fileKey: { $eq: fileKeyWithoutAsci } };
    // const queryResult = await index.query({
    //   topK: 5,
    //   vector: embeddings,
    //   filter: filter,
    //   includeMetadata: true,
    // });

    const queryResult = await index.query({
      queryRequest: {
        topK: 5,
        vector: embeddings,
        filter: filter,
        includeMetadata: true,
      },
    });
    console.log("queryRes=>", queryResult);
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await embeddingTransformer(query);
  console.log("queryEmbeddings", queryEmbeddings);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
  console.log("matched", matches);
  // const qualifyingDocs = matches.filter(
  //   (match) => match.score && match.score > 0.3
  // );

  type Metadata = {
    text: string;
    pageNumber: number;
  };
  let docs = matches.map((match) => (match.metadata as Metadata).text);

  console.log("matching docs=>", docs);
  return docs.join("\n").substring(0, 3000);
}
