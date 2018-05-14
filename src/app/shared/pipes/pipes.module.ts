import { NgModule } from '@angular/core';

import { JoinPipe } from './join.pipe';

@NgModule({
  imports: [],
  declarations: [
    JoinPipe,
  ],
  exports: [
    JoinPipe,
  ]
})
export class PipesModule { }
