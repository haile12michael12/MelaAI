export class MelaEmbeddingService {
  async getEmbedding(text: string) {
    return { text, vector: [] };
  }
}
