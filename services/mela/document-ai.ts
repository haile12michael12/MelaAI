export class MelaDocumentAI {
  async parseDocument(buffer: Buffer) {
    return { extractedText: "", bufferLength: buffer.length };
  }
}
