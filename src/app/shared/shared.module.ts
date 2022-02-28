import { NgModule } from '@angular/core';

import { JoinPipe } from './pipes/join.pipe';

@NgModule({
  imports: [],
  declarations: [
    JoinPipe,
  ],
  exports: [
    JoinPipe,
  ]
})
export class SharedModule { }
