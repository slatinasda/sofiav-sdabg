import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrentQuarterService } from './sabbath-school/current-quarter.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('navbarMain') navbarMain: ElementRef | null = null;

  today = Date.now();
  sabbathSchoolLink: string;

  constructor(private quarterService: CurrentQuarterService) {
    this.sabbathSchoolLink = `/sabbath-school/${this.quarterService.yearAndQuarter()}`;
  }

  hideMobileMenu() {
    this.navbarMain?.nativeElement.classList.remove('show');
  }
}
