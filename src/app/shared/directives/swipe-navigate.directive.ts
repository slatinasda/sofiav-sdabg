import {
  Directive,
  ElementRef,
  Renderer2,
  Input,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Adds resistance-based horizontal swipe navigation to its host element.
 * Vertical drags are left untouched so page scrolling keeps working.
 *
 * The host element itself is never moved. Instead, a small circular arrow indicator is shown in
 * the middle of the screen while dragging - it grows/fades in with a rubber-band resistance
 * curve as the drag progresses, and lights up once the drag passes the trigger threshold,
 * similar to the edge "back" gesture indicator on mobile OSes.
 *
 * Usage:
 *   <div appSwipeNavigate [swipePrevRoute]="prevRoute" [swipeNextRoute]="nextRoute">...</div>
 *
 * Pass `null` for a direction that has no target - the drag will still resist in that
 * direction, but the indicator stays hidden and it never triggers navigation.
 *
 * Mark any nested control that shouldn't trigger swiping (e.g. a popup with a range slider)
 * with the `data-swipe-ignore` attribute - touches starting inside it are ignored.
 */
@Directive({
  selector: '[appSwipeNavigate]',
  standalone: true,
})
export class SwipeNavigateDirective implements OnInit, OnDestroy {
  @Input() swipePrevRoute: any[] | null = null;
  @Input() swipeNextRoute: any[] | null = null;

  private readonly LOCK_THRESHOLD = 10;
  private readonly TRIGGER_DISTANCE = 70;
  private readonly MAX_RESISTANCE = 110;
  private readonly BLOCKED_MAX_RESISTANCE = 36;

  private touchStartX = 0;
  private touchStartY = 0;
  private currentOffset = 0;
  private active = false;
  private directionLocked: 'horizontal' | 'vertical' | null = null;

  private readonly isBrowser: boolean;
  private touchStartListener?: (event: TouchEvent) => void;
  private touchMoveListener?: (event: TouchEvent) => void;
  private touchEndListener?: (event: TouchEvent) => void;

  private indicatorEl: HTMLElement | null = null;
  private indicatorIconEl: HTMLElement | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    const el = this.el.nativeElement;
    this.renderer.setStyle(el, 'touch-action', 'pan-y');

    this.createIndicator();

    this.touchStartListener = (event: TouchEvent) => this.onTouchStart(event);
    this.touchMoveListener = (event: TouchEvent) => this.onTouchMove(event);
    this.touchEndListener = () => this.onTouchEnd();

    el.addEventListener('touchstart', this.touchStartListener, { passive: true });
    // Non-passive: we need to preventDefault() once a horizontal swipe is detected.
    el.addEventListener('touchmove', this.touchMoveListener, { passive: false });
    el.addEventListener('touchend', this.touchEndListener, { passive: true });
    el.addEventListener('touchcancel', this.touchEndListener, { passive: true });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return;
    }

    const el = this.el.nativeElement;
    if (this.touchStartListener) {
      el.removeEventListener('touchstart', this.touchStartListener);
    }

    if (this.touchMoveListener) {
      el.removeEventListener('touchmove', this.touchMoveListener);
    }

    if (this.touchEndListener) {
      el.removeEventListener('touchend', this.touchEndListener);
      el.removeEventListener('touchcancel', this.touchEndListener);
    }

    if (this.indicatorEl) {
      this.indicatorEl.remove();
      this.indicatorEl = null;
      this.indicatorIconEl = null;
    }
  }

  private createIndicator(): void {
    const indicator = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(indicator, 'ss-swipe-indicator');

    const icon = this.renderer.createElement('i') as HTMLElement;
    this.renderer.addClass(icon, 'fa');
    this.renderer.addClass(icon, 'fa-chevron-left');
    this.renderer.appendChild(indicator, icon);

    // Appended to <body> so it centers on the viewport, not the host.
    this.renderer.appendChild(this.document.body, indicator);

    this.indicatorEl = indicator;
    this.indicatorIconEl = icon;
  }

  private onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('[data-swipe-ignore]')) {
      this.active = false;
      return;
    }

    this.setIndicatorTransition(false);
    this.directionLocked = null;
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.active = true;
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.active || event.touches.length !== 1) {
      return;
    }

    const dx = event.touches[0].clientX - this.touchStartX;
    const dy = event.touches[0].clientY - this.touchStartY;

    if (this.directionLocked === null) {
      if (Math.abs(dx) < this.LOCK_THRESHOLD && Math.abs(dy) < this.LOCK_THRESHOLD) {
        return;
      }
      this.directionLocked = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    }

    if (this.directionLocked === 'vertical') {
      // Let the browser handle normal vertical scrolling untouched.
      return;
    }

    // Horizontal drag: block page scroll and apply rubber-band resistance to the indicator.
    event.preventDefault();

    // Swiping left (dx < 0) targets "next"; swiping right (dx > 0) targets "prev".
    const isNext = dx < 0;
    const targetExists = isNext ? !!this.swipeNextRoute : !!this.swipePrevRoute;
    const maxResistance = targetExists ? this.MAX_RESISTANCE : this.BLOCKED_MAX_RESISTANCE;
    this.currentOffset = (dx * maxResistance) / (Math.abs(dx) + maxResistance);

    this.updateIndicator(this.currentOffset, isNext, targetExists, maxResistance);
  }

  private onTouchEnd(): void {
    if (!this.active) {
      return;
    }

    this.active = false;

    if (this.directionLocked !== 'horizontal') {
      this.directionLocked = null;
      return;
    }
    this.directionLocked = null;

    const offset = this.currentOffset;
    this.currentOffset = 0;
    this.setIndicatorTransition(true);
    this.hideIndicator();

    if (offset <= -this.TRIGGER_DISTANCE && this.swipeNextRoute) {
      this.router.navigate(this.swipeNextRoute);
    } else if (offset >= this.TRIGGER_DISTANCE && this.swipePrevRoute) {
      this.router.navigate(this.swipePrevRoute);
    }
  }

  private updateIndicator(
    offset: number,
    isNext: boolean,
    targetExists: boolean,
    maxResistance: number,
  ): void {
    if (!this.indicatorEl || !this.indicatorIconEl) {
      return;
    }

    if (!targetExists) {
      this.hideIndicator();
      return;
    }

    const distance = Math.abs(offset);
    const progress = Math.min(distance / maxResistance, 1);
    const opacityProgress = Math.min(distance / this.TRIGGER_DISTANCE, 1);
    const activated = distance >= this.TRIGGER_DISTANCE;

    this.renderer.removeClass(this.indicatorIconEl, 'fa-chevron-left');
    this.renderer.removeClass(this.indicatorIconEl, 'fa-chevron-right');
    this.renderer.addClass(this.indicatorIconEl, isNext ? 'fa-chevron-right' : 'fa-chevron-left');

    this.renderer.setStyle(this.indicatorEl, 'opacity', `${0.35 + opacityProgress * 0.65}`);
    this.renderer.setStyle(
      this.indicatorEl,
      'transform',
      `translate(-50%, -50%) scale(${0.6 + progress * 0.5})`,
    );
    this.renderer.setStyle(
      this.indicatorIconEl,
      'transform',
      activated ? 'scale(1.15)' : 'scale(1)',
    );

    if (activated) {
      this.renderer.addClass(this.indicatorEl, 'ss-swipe-indicator-active');
    } else {
      this.renderer.removeClass(this.indicatorEl, 'ss-swipe-indicator-active');
    }
  }

  private hideIndicator(): void {
    if (!this.indicatorEl) {
      return;
    }

    this.renderer.setStyle(this.indicatorEl, 'opacity', '0');
    this.renderer.setStyle(this.indicatorEl, 'transform', 'translate(-50%, -50%) scale(0.6)');
    this.renderer.removeClass(this.indicatorEl, 'ss-swipe-indicator-active');
  }

  private setIndicatorTransition(enabled: boolean): void {
    if (!this.indicatorEl) {
      return;
    }

    if (enabled) {
      this.renderer.setStyle(
        this.indicatorEl,
        'transition',
        'transform 0.25s ease, opacity 0.25s ease, background-color 0.15s ease',
      );
    } else {
      this.renderer.setStyle(this.indicatorEl, 'transition', 'background-color 0.15s ease');
    }
  }
}
