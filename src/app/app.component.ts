import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { CurrentQuarterService } from './sabbath-school/current-quarter.service';
import {
  CHURCH_ABBREVIATION,
  CHURCH_FAMILY_NAME,
  CHURCH_NAME,
  CHURCH_PLACE_NAME,
} from './shared/church-info';
import { ThemeSwitcherComponent } from './shared/components/theme-switcher/theme-switcher.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, NgbCollapse, ThemeSwitcherComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  mobileMenuOpen = false;

  readonly churchName = CHURCH_NAME;
  readonly churchFamilyName = CHURCH_FAMILY_NAME;
  readonly churchPlaceName = CHURCH_PLACE_NAME;
  readonly churchAbbreviation = CHURCH_ABBREVIATION;

  readonly today = Date.now();
  readonly sabbathSchoolLink: string;

  constructor(private quarterService: CurrentQuarterService) {
    this.sabbathSchoolLink = `/sabbath-school/${this.quarterService.yearAndQuarter()}`;
  }

  hideMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
