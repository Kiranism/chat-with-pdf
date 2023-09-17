// @ts-ignore
import PipelineSingleton from "./pipeline.js";

export async function embeddingTransformer(text: string) {
  try {
    console.log("transformer initialized");
    // @ts-ignore
    const generateEmbeddings = await PipelineSingleton.getInstance();

    // Actually perform the embedding
    const response = await generateEmbeddings(text.replace(/\n/g, " "), {
      pooling: "mean",
      normalize: true,
    });
    console.log("getEmb result-=>", response);
    return Array.from(response?.data) as number[];
  } catch (error) {
    console.log("error calling transformer for embeddings ai", error);
    throw error;
  }
}

// railway
