import EmberRouter from '@ember/routing/router';
import config from 'ember-book-collection-management/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('books', { path: '/' }, function () {
    this.route('new');
    this.route('edit', { path: '/:book_id/edit' });
  });
});
