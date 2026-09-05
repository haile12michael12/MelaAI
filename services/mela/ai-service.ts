export class MelaAIService {
  async generateResponse(prompt: string) {
    return { prompt, response: "Generated response" };
  }
}
