import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JoinPipe } from './pipes/join.pipe';
import { BibleStudiesCtaComponent } from './components/bible-studies-cta/bible-studies-cta.component';
import { ModalComponent } from './components/modal/modal.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    BibleStudiesCtaComponent,
    JoinPipe,
    ModalComponent,
  ],
  exports: [
    BibleStudiesCtaComponent,
    JoinPipe,
    ModalComponent,
  ]
})
export class SharedModule { }
