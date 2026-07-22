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
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

/**
 * Adds resistance-based horizontal swipe navigation to its host element (e.g. "swipe left/right
 * for next/previous day"). Vertical drags are left untouched so page scrolling keeps working.
 *
 * Usage:
 *   <div appSwipeNavigate [swipePrevRoute]="prevRoute" [swipeNextRoute]="nextRoute">...</div>
 *
 * Pass `null` for a direction that has no target (e.g. there's no previous day) - the drag
 * will still resist in that direction, but capped low and never triggers navigation.
 *
 * Mark any nested control that shouldn't trigger swiping (e.g. a settings popup with a
 * range slider) with the `data-swipe-ignore` attribute - touches starting inside it are ignored.
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

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    const el = this.el.nativeElement;
    this.renderer.setStyle(el, 'touch-action', 'pan-y');
    this.renderer.setStyle(el, 'will-change', 'transform');

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

    this.setTransition(false);
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

    // Horizontal drag: block page scroll and apply rubber-band resistance.
    event.preventDefault();

    // Swiping left (dx < 0) targets "next"; swiping right (dx > 0) targets "prev".
    const targetExists = dx < 0 ? !!this.swipeNextRoute : !!this.swipePrevRoute;
    const maxResistance = targetExists ? this.MAX_RESISTANCE : this.BLOCKED_MAX_RESISTANCE;
    this.currentOffset = (dx * maxResistance) / (Math.abs(dx) + maxResistance);
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `translateX(${this.currentOffset}px)`,
    );
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
    this.setTransition(true);
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateX(0px)');

    if (offset <= -this.TRIGGER_DISTANCE && this.swipeNextRoute) {
      this.router.navigate(this.swipeNextRoute);
    } else if (offset >= this.TRIGGER_DISTANCE && this.swipePrevRoute) {
      this.router.navigate(this.swipePrevRoute);
    }
  }

  private setTransition(enabled: boolean): void {
    const el = this.el.nativeElement;
    if (enabled) {
      this.renderer.setStyle(el, 'transition', 'transform 0.25s ease');
    } else {
      this.renderer.removeStyle(el, 'transition');
    }
  }
}
