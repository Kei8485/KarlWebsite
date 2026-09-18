import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { TopicDetailPageRoutingModule } from './topic-detail-routing.module';

import { TopicDetailPage } from './topic-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TopicDetailPageRoutingModule
  ],
  declarations: [TopicDetailPage]
})
export class TopicDetailPageModule {}
