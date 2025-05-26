import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type BookModel from 'ember-book-collection-management/models/book';

export default class BooksNewRoute extends Route {
  @service declare store: Store;
  model(): BookModel {
    return this.store.createRecord('book', {}) as BookModel;
  }
}
