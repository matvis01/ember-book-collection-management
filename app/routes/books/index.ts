import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type BookModel from 'ember-book-collection-management/models/book';

export default class BooksRoute extends Route {
  @service declare store: Store;
  async model(): Promise<BookModel[]> {
    // For demo purposes, let's create some initial data if none exists
    const books = (await this.store.findAll('book')) as BookModel[];

    if (books.length === 0) {
      // Create some demo books
      await (
        this.store.createRecord('book', {
          title: 'Clean Code',
          author: 'Robert C. Martin',
          year: 2008,
          category: 'Programming',
        }) as BookModel
      ).save();

      await (
        this.store.createRecord('book', {
          title: 'The Pragmatic Programmer',
          author: 'David Thomas, Andrew Hunt',
          year: 1999,
          category: 'Programming',
        }) as BookModel
      ).save();

      await (
        this.store.createRecord('book', {
          title: 'Design Patterns',
          author: 'Gang of Four',
          year: 1994,
          category: 'Programming',
        }) as BookModel
      ).save();

      await (
        this.store.createRecord('book', {
          title: 'Refactoring',
          author: 'Martin Fowler',
          year: 1999,
          category: 'Programming',
        }) as BookModel
      ).save();

      return (await this.store.findAll('book')) as BookModel[];
    }

    return books;
  }
}
