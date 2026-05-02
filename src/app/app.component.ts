import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrentQuarterService } from './sabbath-school/current-quarter.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('navbarMain') navbarMain: ElementRef | null = null;

  today = Date.now();
  sabbathSchoolLink: string;

  constructor(
    private quarterService: CurrentQuarterService,
    private renderer: Renderer2,
  ) {
    this.sabbathSchoolLink = `/sabbath-school/${this.quarterService.yearAndQuarter()}`;
  }

  ngOnInit() {
    setTimeout(() => {
      const appRoot = this.renderer.selectRootElement('app-root', true);
      this.renderer.removeClass(appRoot, 'app-root--loading');
      this.renderer.addClass(appRoot, 'app-root--ready');
    }, 500);
  }

  hideMobileMenu() {
    this.navbarMain?.nativeElement.classList.remove('show');
  }
}
