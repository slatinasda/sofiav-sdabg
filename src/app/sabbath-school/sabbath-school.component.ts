import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppTitleService } from '../app-title.service';

@Component({
  selector: 'app-sabbath-school',
  templateUrl: './sabbath-school.component.html',
  styleUrls: ['./sabbath-school.component.scss']
})
export class SabbathSchoolComponent implements OnInit {
  sabbathSchoolUrl: SafeResourceUrl;

  constructor(
    private appTitleService: AppTitleService,
    private sanitizer: DomSanitizer,
  ) {
    this.appTitleService.setTitle('Съботен урок');
    this.sabbathSchoolUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  ngOnInit() {
    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const quarterStr = quarter.toString().padStart(2, '0');
    const url = `https://sabbath-school.adventech.io/bg/${year}-${quarterStr}/`;
    this.sabbathSchoolUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
