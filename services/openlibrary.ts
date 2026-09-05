export class OpenLibraryService {
  async searchBook(title: string) {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(title)}`);
    return res.json();
  }
}
