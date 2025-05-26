import Component from '@glimmer/component';
import { action } from '@ember/object';

interface DeleteConfirmationModalArgs {
  isOpen: boolean;
  bookTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default class DeleteConfirmationModalComponent extends Component<DeleteConfirmationModalArgs> {
  @action
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
