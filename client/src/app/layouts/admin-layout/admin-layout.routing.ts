import {Routes} from '@angular/router';

import {DashboardComponent} from '../../pages/dashboard/dashboard.component';
import {IconsComponent} from '../../pages/icons/icons.component';
import {MapsComponent} from '../../pages/maps/maps.component';
import {UserProfileComponent} from '../../pages/user-profile/user-profile.component';
import {TablesComponent} from '../../pages/tables/tables.component';
import {PropertiesComponent} from '../../pages/properties/properties.component';
import {TransactionsComponent} from '../../pages/transactions/transactions.component';
import {CreateTransactionComponent} from '../../pages/create-transaction/create-transaction.component';
import {CreatePropertyComponent} from '../../pages/create-property/create-property.component';
import {SendMessageComponent} from '../../pages/send-message/send-message.component';
import {MessagesComponent} from '../../pages/messages/messages.component';
import {MiningComponent} from '../../pages/mining/mining.component';

export const AdminLayoutRoutes: Routes = [
  {path: 'dashboard', component: DashboardComponent},
  {path: 'property', component: PropertiesComponent},
  {path: 'property/create', component: CreatePropertyComponent},
  {path: 'transaction', component: TransactionsComponent},
  {path: 'transaction/create', component: CreateTransactionComponent},
  {path: 'message/:type/:id', component: SendMessageComponent},
  {path: 'message', component: MessagesComponent},
  {path: 'mining', component: MiningComponent},
  {path: 'user-profile', component: UserProfileComponent},
  {path: 'tables', component: TablesComponent},
  {path: 'icons', component: IconsComponent},
  {path: 'maps', component: MapsComponent}
];
