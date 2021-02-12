import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

/* Import Components */
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { CallbackComponent } from './login/callback/callback.component';
import { HueSetupComponent } from './hue-setup/hue-setup.component';

/* Define Routes */
const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login/callback', component: CallbackComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'hue-setup', component: HueSetupComponent }
];


@NgModule({
  declarations: [ /* Register Components */
    AppComponent,
    DashboardComponent,
    LoginComponent,
    HomeComponent,
    CallbackComponent,
    HueSetupComponent,
  ],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot(appRoutes),
        HttpClientModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
