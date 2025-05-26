import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-book-collection-management/tests/helpers';
import { visit, click, fillIn, currentURL } from '@ember/test-helpers';

module('Acceptance | books', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /books shows the book list', async function (assert) {
    await visit('/books');
    assert.strictEqual(currentURL(), '/books');
    assert.dom('[data-test-book-item]').exists({ count: 3 }); // Demo books
  });

  test('can add a new book', async function (assert) {
    await visit('/books');
    await click('[data-test-add-book-button]');

    assert.strictEqual(currentURL(), '/books/new');

    await fillIn('[data-test-title-input]', 'Test Book');
    await fillIn('[data-test-author-input]', 'Test Author');
    await fillIn('[data-test-year-input]', '2023');
    await fillIn('[data-test-category-input]', 'Fiction');

    await click('[data-test-save-button]');

    assert.strictEqual(currentURL(), '/books');
    assert.dom('[data-test-book-item]').exists({ count: 4 });
  });

  test('can filter books by category', async function (assert) {
    await visit('/books');

    await fillIn('[data-test-category-filter]', 'Fiction');

    assert.dom('[data-test-book-item]').exists({ count: 1 }); // Only fiction books
  });

  test('can sort books', async function (assert) {
    await visit('/books');

    await click('[data-test-sort-select] option[value="author"]');

    // Check that books are sorted by author
    assert
      .dom('[data-test-book-item]:first-child [data-test-book-author]')
      .hasText('George Orwell');
  });
});
