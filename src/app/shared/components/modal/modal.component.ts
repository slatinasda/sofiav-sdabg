import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  OnDestroy,
  NgZone,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() size: 'default' | 'lg' | 'sm' = 'default';
  @Input() urlFragment = 'popup';
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closeEvent = new EventEmitter<void>();

  private _open = false;
  private readonly isBrowser: boolean;

  constructor(
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @Input()
  set open(value: boolean) {
    if (value && !this._open) {
      this.addFragment();
    }
    this._open = value;
  }

  get open(): boolean {
    return this._open;
  }

  ngOnInit() {
    if (this.urlFragment && this.isBrowser) {
      // Listen for browser back/forward navigation
      // When the user presses back and the #fragment is removed, close the modal
      window.addEventListener('popstate', this.onPopState);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('popstate', this.onPopState);
    }
  }

  private onPopState = (): void => {
    if (this._open) {
      this.zone.run(() => {
        this._open = false;
        this.openChange.emit(false);
        this.closeEvent.emit();
      });
    }
  };

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: Event): void {
    if (this._open) {
      this.goBack();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.goBack();
    }
  }

  /**
   * Closes the modal by triggering the browser back button.
   */
  goBack(): void {
    if (this._open && this.isBrowser) {
      window.history.back();
    }
  }

  private addFragment(): void {
    if (this.urlFragment && this.isBrowser) {
      const path = window.location.pathname + window.location.search;
      const fragment = '#' + this.urlFragment;
      if (!path.endsWith(fragment)) {
        window.history.pushState(null, '', path + fragment);
      }
    }
  }
}
