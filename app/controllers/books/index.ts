import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type BookModel from 'ember-book-collection-management/models/book';
import type Store from '@ember-data/store';
import type Router from '@ember/routing/router';

export default class BooksIndexController extends Controller {
  @service declare store: Store;
  @service declare router: Router;

  @tracked filterCategory = '';
  @tracked sortBy = 'title';
  @tracked sortOrder: 'asc' | 'desc' = 'asc';
  @tracked showDeleteModal = false;
  @tracked bookToDelete: BookModel | null = null;

  declare model: BookModel[];
  get categories(): string[] {
    const cats = this.model
      .map((book) => book.category || '')
      .filter((cat) => cat.trim() !== '');
    return [...new Set(cats)].sort();
  }
  get filteredAndSortedBooks(): BookModel[] {
    // Create a copy of the array to avoid mutating the original Ember Data array
    // Also filter out any books that don't have required properties
    let books = [...this.model].filter(
      (book) =>
        book &&
        typeof book.title === 'string' &&
        typeof book.author === 'string' &&
        typeof book.category === 'string',
    );

    // Filter by category
    if (this.filterCategory) {
      books = books.filter((book) => book.category === this.filterCategory);
    } // Sort books
    books = books.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (this.sortBy === 'title') {
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
      } else if (this.sortBy === 'author') {
        aValue = (a.author || '').toLowerCase();
        bValue = (b.author || '').toLowerCase();
      } else if (this.sortBy === 'year') {
        aValue = a.year || 0;
        bValue = b.year || 0;
      }

      if (aValue < bValue) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return books;
  }
  @action
  updateFilterCategory(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterCategory = target.value;
  }

  @action
  updateSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
  }
  @action
  showDeleteConfirmation(book: BookModel): void {
    this.bookToDelete = book;
    this.showDeleteModal = true;
  }

  @action
  hideDeleteModal(): void {
    this.showDeleteModal = false;
    this.bookToDelete = null;
  }

  @action
  async confirmDeleteBook(): Promise<void> {
    if (this.bookToDelete) {
      try {
        await this.bookToDelete.destroyRecord();
        this.hideDeleteModal();
      } catch (error) {
        console.error('Error deleting book:', error);
        // Keep modal open on error so user can try again
      }
    }
  }

  @action
  navigateToNew(): void {
    this.router.transitionTo('books.new');
  }

  @action
  navigateToEdit(book: BookModel): void {
    this.router.transitionTo('books.edit', book.id);
  }

  @action
  clearFilter(): void {
    this.filterCategory = '';
  }
}
