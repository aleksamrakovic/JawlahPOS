import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { DpDatePickerModule } from 'ng2-date-picker';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { MAT_DATE_LOCALE } from '@angular/material/core';

import { AppComponent } from '../app.component';
import { CashFloatComponent } from '../cash-float/cash-float.component';
import { TicketsComponent } from '../tickets/tickets.component';
import { PeriodPassesComponent } from '../period-passes/period-passes.component';
import { AccountsComponent } from '../accounts/accounts.component';
import { ReportsComponent } from '../reports/reports.component';
import { PenaltiesComponent } from '../penalties/penalties.component';
import { PosUserComponent } from '../pos-user/pos-user.component';
import { AppRoutingModule } from '../_router/app-routing.module';
import { CityComponent } from '../tickets/city/city.component';
import { CartComponent } from '../tickets/cart/cart.component';
import { IntercityComponent } from '../tickets/intercity/intercity.component';
import { AuthService } from '../_service/auth.service';
import { CheckoutComponent } from '../checkout/checkout.component';
import { CashComponent } from '../checkout/cash/cash.component';
import { CardComponent } from '../checkout/card/card.component';
import { LoginComponent } from '../login/login.component';
import { SingleAccountComponent } from '../accounts/single-account/single-account.component';
import { AccountStatusComponent } from '../accounts/single-account/account-status/account-status.component';
import { TopUpAccountComponent } from '../accounts/single-account/account-topup/top-up-account.component';
import { WaselDetailsComponent } from '../accounts/single-account/wasel-details/wasel-details.component';
import { AccountDevicesComponent } from '../accounts/single-account/account-devices/account-devices.component';
import { AccountPaymentsComponent } from '../accounts/single-account/account-payments/account-payments.component';
import { AccountPenaltiesComponent } from '../accounts/single-account/account-penalties/account-penalties.component';
import { DriverCardsComponent } from '../driver-cards/driver-cards.component';
import { DriverSearchPipe } from '../driver-cards/driver-search.pipe';
import { CashOutComponent } from '../cash-out/cash-out.component';
import { PenaltyDetailsComponent } from '../penalties/penalty-details/penalty-details.component';
import { AuthInterceptor } from '../_service/auth.interceptor.service';
import { MainLayoutComponent } from '../layouts/main-layout/main-layout.component';
import { LayoutWithoutSidenavComponent } from '../layouts/layout-without-sidenav/layout-without-sidenav.component';
import { AccountManageComponent } from '../accounts/single-account/account-manage/account-manage.component';
import { AccountLinksComponent } from '../accounts/single-account/account-links/account-links.component';
import { AccountVerifyComponent } from '../accounts/single-account/account-verify/account-verify.component';
import { PeriodCityComponent } from '../period-passes/period-city/period-city.component';
import { PeriodIntercityComponent } from '../period-passes/period-intercity/period-intercity.component';
import { AccountLayoutComponent } from '../layouts/account-layout/account-layout.component';
import { LinkNewAccountComponent } from '../accounts/single-account/account-links/link-new-account/link-new-account.component';
import { AccountTicketsComponent } from '../accounts/single-account/account-tickets/account-tickets.component';
import { AccCityComponent } from '../accounts/single-account/account-tickets/acc-city/acc-city.component';
import { IntercityRouteComponent } from '../tickets/intercity-route/intercity-route.component';
import { MaintainComponent } from '../maintain/maintain.component';
import { MaintainStatusComponent } from '../maintain/maintain-status/maintain-status.component';
import { PosSettingsComponent } from '../maintain/pos-settings/pos-settings.component';
import { PeriodIntercityRouteComponent } from '../period-passes/period-intercity-route/period-intercity-route.component';
import { NewPasswordComponent } from '../login/new-password/new-password.component';
import { LoginPasswordComponent } from '../login/login-password/login-password.component';
import { CashoutPopupComponent } from '../cash-out/cashout-popup/cashout-popup.component';
import { PosUserHistoryComponent } from '../pos-user/pos-user-history/pos-user-history.component';
import { AccIntercityRoutesComponent } from '../accounts/single-account/account-tickets/acc-intercity-routes/acc-intercity-routes.component';
import { AccIntercityComponent } from '../accounts/single-account/account-tickets/acc-intercity/acc-intercity.component';
import { AccTicketsListComponent } from '../accounts/single-account/account-tickets/acc-tickets-list/acc-tickets-list.component';
import { AccountPenaltyDetailsComponent } from '../accounts/single-account/account-penalties/account-penalty-details/account-penalty-details.component';
import { PeriodProductsComponent } from '../period-passes/period-products/period-products.component';
import { AccountPeriodPassComponent } from '../accounts/single-account/account-period-pass/account-period-pass.component';
import { AccPeriodProductComponent } from '../accounts/single-account/account-period-pass/acc-period-product/acc-period-product.component';
import { AccPeriodCityComponent } from '../accounts/single-account/account-period-pass/acc-period-city/acc-period-city.component';
import { DetailReportComponent } from '../reports/detail-report/detail-report.component';
import { CreateFormComponent } from '../accounts/create/create-form/create-form.component';
import { DetailSearchPipe } from '../reports/detail-report/detail-search.pipe';
import { LoginUsernameComponent } from '../login/login-username/login-username.component';
import { WaybillComponent } from '../reports/waybill/waybill.component';
import { FilterSearchPipe } from '../_service/filter-search.pipe';
import { AccountVerifyScratchComponent } from '../accounts/single-account/account-verify/account-verify-scratch/account-verify-scratch.component';
import { AccountRiderComponent } from '../accounts/single-account/account-verify/account-rider/account-rider.component';
import { AccountVerifyViewComponent } from '../accounts/single-account/account-verify/account-verify-view/account-verify-view.component';
import { AccPaymentsDetailsComponent } from '../accounts/single-account/account-payments/acc-payments-details/acc-payments-details.component';
import { LuggageComponent } from '../tickets/luggage/luggage.component';
import { AlertComponent } from '../_components/alert/alert.component';
import { TopNavComponent } from '../_components/top-nav/top-nav.component';
import { UserMenuComponent } from '../_components/user-menu/user-menu.component';
import { UserLockComponent } from '../_components/user-menu/user-lock/user-lock.component';
import { HeaderComponent } from '../_components/header/header.component';
import { DeviceBlockComponent } from '../_components/device-block/device-block.component';
import { LoadingSpinnerComponent } from '../_components/loading-spinner/loading-spinner.component';

import { MaterialModule } from './material.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CashFloatComponent,
    TicketsComponent,
    PeriodPassesComponent,
    AccountsComponent,
    ReportsComponent,
    PenaltiesComponent,
    PosUserComponent,
    CityComponent,
    TopNavComponent,
    CartComponent,
    IntercityComponent,
    CheckoutComponent,
    CashComponent,
    CardComponent,
    LoginComponent,
    SingleAccountComponent,
    AccountStatusComponent,
    TopUpAccountComponent,
    WaselDetailsComponent,
    AccountDevicesComponent,
    AccountPaymentsComponent,
    AccountPenaltiesComponent,
    DriverCardsComponent,
    DriverSearchPipe,
    UserMenuComponent,
    CashOutComponent,
    PenaltyDetailsComponent,
    DeviceBlockComponent,
    MainLayoutComponent,
    LayoutWithoutSidenavComponent,
    UserLockComponent,
    AccountManageComponent,
    AccountLinksComponent,
    AccountVerifyComponent,
    PeriodCityComponent,
    PeriodIntercityComponent,
    AccountLayoutComponent,
    LinkNewAccountComponent,
    AccountTicketsComponent,
    AccCityComponent,
    IntercityRouteComponent,
    MaintainComponent,
    MaintainStatusComponent,
    PosSettingsComponent,
    PeriodIntercityRouteComponent,
    NewPasswordComponent,
    LoginPasswordComponent,
    CashoutPopupComponent,
    PosUserHistoryComponent,
    AccIntercityRoutesComponent,
    AccIntercityComponent,
    AccTicketsListComponent,
    AccountPenaltyDetailsComponent,
    LoadingSpinnerComponent,
    PeriodProductsComponent,
    AccountPeriodPassComponent,
    AccPeriodProductComponent,
    AccPeriodCityComponent,
    DetailReportComponent,
    CreateFormComponent,
    DetailSearchPipe,
    LoginUsernameComponent,
    WaybillComponent,
    FilterSearchPipe,
    AccountVerifyScratchComponent,
    AccountRiderComponent,
    AccountVerifyViewComponent,
    AccPaymentsDetailsComponent,
    AlertComponent,
    LuggageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgxPaginationModule,
    DpDatePickerModule,
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
  }),
    MaterialModule
  ],
  providers: [AuthService, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }, {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},],
  bootstrap: [AppComponent]
})
export class AppModule { }
