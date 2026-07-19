import { Component, OnInit, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { CurrentQuarterService } from './sabbath-school/current-quarter.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, NgbCollapse],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  mobileMenuOpen = false;

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
    this.mobileMenuOpen = false;
  }
}
