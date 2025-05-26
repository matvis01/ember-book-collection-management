import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type BookModel from 'ember-book-collection-management/models/book';
import type Router from '@ember/routing/router';
import type Owner from '@ember/owner';

interface BookFormArgs {
  book: BookModel;
  onSave?: (book: BookModel) => void;
  onCancel?: () => void;
}

export default class BookFormComponent extends Component<BookFormArgs> {
  @service declare router: Router;

  @tracked title = '';
  @tracked author = '';
  @tracked year = new Date().getFullYear();
  @tracked category = '';
  @tracked errors: string[] = [];
  constructor(owner: Owner, args: BookFormArgs) {
    super(owner, args);

    // Initialize form with book data if editing
    if (this.args.book.id) {
      this.title = this.args.book.title || '';
      this.author = this.args.book.author || '';
      this.year = this.args.book.year || new Date().getFullYear();
      this.category = this.args.book.category || '';
    }
  }

  get isEditing(): boolean {
    return !!this.args.book.id;
  }
  get submitButtonText(): string {
    return this.isEditing ? 'Update Book' : 'Add Book';
  }
  validateForm(): boolean {
    this.errors = [];

    if (!this.title.trim()) {
      this.errors.push('Title is required');
    }

    if (!this.author.trim()) {
      this.errors.push('Author is required');
    }

    if (!this.category.trim()) {
      this.errors.push('Category is required');
    }

    if (this.year < 1000 || this.year > new Date().getFullYear() + 10) {
      this.errors.push(
        'Publication year must be between 1000 and ' +
          (new Date().getFullYear() + 10),
      );
    }

    return this.errors.length === 0;
  }

  @action
  updateTitle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.title = target.value;
  }

  @action
  updateAuthor(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.author = target.value;
  }

  @action
  updateYear(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.year = parseInt(target.value, 10);
  }

  @action
  updateCategory(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.category = target.value;
  }

  @action
  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    try {
      // Update the book model
      this.args.book.title = this.title.trim();
      this.args.book.author = this.author.trim();
      this.args.book.year = this.year;
      this.args.book.category = this.category.trim();

      // Save the book
      await this.args.book.save();

      // Call the onSave callback if provided
      if (this.args.onSave) {
        this.args.onSave(this.args.book);
      } else {
        // Default navigation to books index
        this.router.transitionTo('books.index');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      this.errors = ['An error occurred while saving the book'];
    }
  }

  @action
  handleCancel(): void {
    if (this.args.onCancel) {
      this.args.onCancel();
    } else {
      // Default navigation to books index
      this.router.transitionTo('books.index');
    }
  }
}
