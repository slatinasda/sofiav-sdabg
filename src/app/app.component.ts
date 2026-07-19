import { Component } from '@angular/core';
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
export class AppComponent {
  mobileMenuOpen = false;

  today = Date.now();
  sabbathSchoolLink: string;

  constructor(private quarterService: CurrentQuarterService) {
    this.sabbathSchoolLink = `/sabbath-school/${this.quarterService.yearAndQuarter()}`;
  }

  hideMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
