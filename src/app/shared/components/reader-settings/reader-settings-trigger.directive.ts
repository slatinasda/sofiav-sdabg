import { Directive } from '@angular/core';

/**
 * Marks a projected trigger for the reader settings popover and wires the
 * Bootstrap dropdown attributes. Consumers keep full control of the trigger
 * markup and styling.
 */
@Directive({
  selector: '[readerSettingsTrigger]',
  standalone: true,
  host: {
    'data-bs-toggle': 'dropdown',
    'data-bs-auto-close': 'outside',
    'aria-expanded': 'false',
  },
})
export class ReaderSettingsTriggerDirective {}
