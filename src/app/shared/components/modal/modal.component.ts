import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'default' | 'lg' | 'sm' = 'default';
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closeEvent = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent): void {
    if (this.open) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.close();
    }
  }

  close(): void {
    this.open = false;
    this.openChange.emit(false);
    this.closeEvent.emit();
  }
}
