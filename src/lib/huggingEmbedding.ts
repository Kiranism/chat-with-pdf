import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

export async function hfEmbedding(text: string) {
  try {
    const response = await hf.featureExtraction({
      model: "BAAI/bge-base-en",
      inputs: {
        inputs: text.replace(/\n/g, " "),
      },
    });
    console.log("getEmb result-=>", response);
    return response;
  } catch (error) {
    console.log("error calling openai embeddings ai", error);
    throw error;
  }
}
