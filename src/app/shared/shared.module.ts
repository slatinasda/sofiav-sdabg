import { NgModule } from '@angular/core';

import { JoinPipe } from './pipes/join.pipe';
import { BibleStudiesCtaComponent } from './components/bible-studies-cta/bible-studies-cta.component';

@NgModule({
  imports: [],
  declarations: [
    BibleStudiesCtaComponent,
    JoinPipe,
  ],
  exports: [
    BibleStudiesCtaComponent,
    JoinPipe,
  ]
})
export class SharedModule { }
