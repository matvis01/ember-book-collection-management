import Model, { attr } from '@ember-data/model';

export default class BookModel extends Model {
  @attr('string') declare title: string;
  @attr('string') declare author: string;
  @attr('number') declare year: number;
  @attr('string') declare category: string;

  get displayTitle(): string {
    return `${this.title} (${this.year})`;
  }
}
