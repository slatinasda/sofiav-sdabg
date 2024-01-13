import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('navbarMain') navbarMain: ElementRef | null = null;

  today = Date.now();

  hideMobileMenu() {
    this.navbarMain?.nativeElement.classList.remove('show');
  }
}
