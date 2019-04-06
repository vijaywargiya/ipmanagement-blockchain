import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {PropertiesComponent} from '../../pages/properties/properties.component';
import {TransactionsComponent} from '../../pages/transactions/transactions.component';
import {CdkTableModule} from '@angular/cdk/table';
import {CreatePropertyComponent} from '../../pages/create-property/create-property.component';
import {CreateTransactionComponent} from '../../pages/create-transaction/create-transaction.component';
import {SendMessageComponent} from '../../pages/send-message/send-message.component';
import {MessagesComponent} from '../../pages/messages/messages.component';
import {MiningComponent} from '../../pages/mining/mining.component';
// import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    CdkTableModule,
    ReactiveFormsModule
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TablesComponent,
    IconsComponent,
    MapsComponent,
    PropertiesComponent,
    TransactionsComponent,
    CreatePropertyComponent,
    CreateTransactionComponent,
    SendMessageComponent,
    MessagesComponent,
    MiningComponent,
  ]
})

export class AdminLayoutModule {}
