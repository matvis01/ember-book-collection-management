import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type BookModel from 'ember-book-collection-management/models/book';

export default class BooksEditRoute extends Route {
  @service declare store: Store;
  async model(params: { book_id: string }): Promise<BookModel> {
    return (await this.store.findRecord('book', params.book_id)) as BookModel;
  }
}
