import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { tracked } from '@glimmer/tracking';

export default class ApplicationAdapter extends JSONAPIAdapter {
  @tracked namespace = 'api';

  // Use localStorage for demo purposes
  findAll(): Promise<any> {
    return new Promise((resolve) => {
      const books = this.getFromStorage();
      resolve({
        data: books.map((book: any) => ({
          type: 'book',
          id: book.id,
          attributes: {
            title: book.title,
            author: book.author,
            year: book.year,
            category: book.category,
          },
        })),
      });
    });
  }

  findRecord(store: any, type: any, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const books = this.getFromStorage();
      const book = books.find((b: any) => b.id === id);

      if (book) {
        resolve({
          data: {
            type: 'book',
            id: book.id,
            attributes: {
              title: book.title,
              author: book.author,
              year: book.year,
              category: book.category,
            },
          },
        });
      } else {
        reject(new Error(`Book with id ${id} not found`));
      }
    });
  }

  createRecord(store: any, type: any, snapshot: any): Promise<any> {
    return new Promise((resolve) => {
      const books = this.getFromStorage();
      const newBook = {
        id: this.generateId(),
        title: snapshot.attr('title'),
        author: snapshot.attr('author'),
        year: snapshot.attr('year'),
        category: snapshot.attr('category'),
      };

      books.push(newBook);
      this.saveToStorage(books);

      resolve({
        data: {
          type: 'book',
          id: newBook.id,
          attributes: {
            title: newBook.title,
            author: newBook.author,
            year: newBook.year,
            category: newBook.category,
          },
        },
      });
    });
  }

  updateRecord(store: any, type: any, snapshot: any): Promise<any> {
    return new Promise((resolve) => {
      const books = this.getFromStorage();
      const bookIndex = books.findIndex((b: any) => b.id === snapshot.id);

      if (bookIndex !== -1) {
        books[bookIndex] = {
          id: snapshot.id,
          title: snapshot.attr('title'),
          author: snapshot.attr('author'),
          year: snapshot.attr('year'),
          category: snapshot.attr('category'),
        };

        this.saveToStorage(books);

        resolve({
          data: {
            type: 'book',
            id: snapshot.id,
            attributes: {
              title: snapshot.attr('title'),
              author: snapshot.attr('author'),
              year: snapshot.attr('year'),
              category: snapshot.attr('category'),
            },
          },
        });
      }
    });
  }

  deleteRecord(store: any, type: any, snapshot: any): Promise<any> {
    return new Promise((resolve) => {
      const books = this.getFromStorage();
      const filteredBooks = books.filter((b: any) => b.id !== snapshot.id);
      this.saveToStorage(filteredBooks);

      resolve({ data: null });
    });
  }

  private getFromStorage(): any[] {
    const stored = localStorage.getItem('ember-books');
    return stored ? JSON.parse(stored) : [];
  }

  private saveToStorage(books: any[]): void {
    localStorage.setItem('ember-books', JSON.stringify(books));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
