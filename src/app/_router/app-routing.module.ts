import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TicketsComponent } from '../tickets/tickets.component';
import { PeriodPassesComponent } from '../period-passes/period-passes.component';
import { AccountsComponent } from '../accounts/accounts.component';
import { ReportsComponent } from '../reports/reports.component';
import { PenaltiesComponent } from '../penalties/penalties.component';
import { PosUserComponent } from '../pos-user/pos-user.component';
import { CashFloatComponent } from '../cash-float/cash-float.component';
import { CityComponent } from '../tickets/city/city.component';
import { IntercityComponent } from '../tickets/intercity/intercity.component';
import { CheckoutComponent } from '../checkout/checkout.component';
import { LoginComponent } from '../login/login.component';
import { DriverCardsComponent } from '../driver-cards/driver-cards.component';
import { CashOutComponent } from '../cash-out/cash-out.component';
import { AuthGuard } from '../_guards/auth.guard';
import { MainLayoutComponent } from '../layouts/main-layout/main-layout.component';
import { LayoutWithoutSidenavComponent } from '../layouts/layout-without-sidenav/layout-without-sidenav.component';
import { SingleAccountComponent } from '../accounts/single-account/single-account.component';
import { PeriodCityComponent } from '../period-passes/period-city/period-city.component';
import { PeriodIntercityComponent } from '../period-passes/period-intercity/period-intercity.component';
import { AccountLayoutComponent } from '../layouts/account-layout/account-layout.component';
import { TopUpAccountComponent } from '../accounts/single-account/account-topup/top-up-account.component';
import { WaselDetailsComponent } from '../accounts/single-account/wasel-details/wasel-details.component';
import { AccountPenaltiesComponent } from '../accounts/single-account/account-penalties/account-penalties.component';
import { AccountDevicesComponent } from '../accounts/single-account/account-devices/account-devices.component';
import { AccountPaymentsComponent } from '../accounts/single-account/account-payments/account-payments.component';
import { AccountManageComponent } from '../accounts/single-account/account-manage/account-manage.component';
import { AccountLinksComponent } from '../accounts/single-account/account-links/account-links.component';
import { AccountVerifyComponent } from '../accounts/single-account/account-verify/account-verify.component';
import { LinkNewAccountComponent } from '../accounts/single-account/account-links/link-new-account/link-new-account.component';
import { CashFloatGuardService } from '../_guards/cash-float-guard.service';
import { AccountTicketsComponent } from '../accounts/single-account/account-tickets/account-tickets.component';
import { AccCityComponent } from '../accounts/single-account/account-tickets/acc-city/acc-city.component';
import { IntercityRouteComponent } from '../tickets/intercity-route/intercity-route.component';
import { MaintainComponent } from '../maintain/maintain.component';
import { PosSettingsComponent } from '../maintain/pos-settings/pos-settings.component';
import { PeriodIntercityRouteComponent } from '../period-passes/period-intercity-route/period-intercity-route.component';
import { NewPasswordComponent } from '../login/new-password/new-password.component';
import { RoleGuard } from '../_guards/role-guard.service';
import { LoginPasswordComponent } from '../login/login-password/login-password.component';
import { LockGuard } from '../_guards/lock-guard.service';
import { PenaltyDetailsComponent } from '../penalties/penalty-details/penalty-details.component';
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
import { UserRoles } from '../entities/entitities';
import { CreateFormComponent } from '../accounts/create/create-form/create-form.component';
import { BlockGuard } from '../_guards/block.guard';
import { LoginUsernameComponent } from '../login/login-username/login-username.component';
import { WaybillComponent } from '../reports/waybill/waybill.component';
import { AccountVerifyScratchComponent } from '../accounts/single-account/account-verify/account-verify-scratch/account-verify-scratch.component';
import { AccountRiderComponent } from '../accounts/single-account/account-verify/account-rider/account-rider.component';
import { AccountVerifyViewComponent } from '../accounts/single-account/account-verify/account-verify-view/account-verify-view.component';
import { AccPaymentsDetailsComponent } from '../accounts/single-account/account-payments/acc-payments-details/acc-payments-details.component';
import { LuggageComponent } from '../tickets/luggage/luggage.component';
import { UserLockComponent } from '../_components/user-menu/user-lock/user-lock.component';
import { DeviceBlockComponent } from '../_components/device-block/device-block.component';


const appRoutes: Routes = [

  //Main site routes goes here
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'period-pass', pathMatch: 'full' },
      { path: 'cash-float', component: CashFloatComponent, canActivate: [AuthGuard, LockGuard, BlockGuard] },
      { path: 'cash-out', component: CashOutComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'tickets', component: TicketsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard, RoleGuard],
      data: { roles: [UserRoles.RetailSupervisor, UserRoles.Administrator, UserRoles.CSA] } },
      { path: 'city', component: CityComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'intercity-ticket', component: IntercityComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'intercity-route', component: IntercityRouteComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'luggage', component: LuggageComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'period-pass', component: PeriodPassesComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'period-products', component: PeriodProductsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'period-city', component: PeriodCityComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      // { path: 'period-intercity-ticket', component: PeriodIntercityComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard] },
      // { path: 'period-intercity-route', component: PeriodIntercityRouteComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard] },
      { path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'accounts/create/form', component: CreateFormComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'reports/transactions', component: DetailReportComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'reports/waybill', component: WaybillComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      // { path: 'penalties', component: PenaltiesComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      // { path: 'penalties/details', component: PenaltyDetailsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'pos-user', component: PosUserComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, RoleGuard, BlockGuard],
        //role guard
        data: { roles: [UserRoles.RetailSupervisor, UserRoles.Administrator]} },
      { path: 'pos-user/history', component: PosUserHistoryComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard, RoleGuard], //role guard
        data: { roles: [UserRoles.RetailSupervisor, UserRoles.Administrator] }
      },
      // { path: 'driver-cards', component: DriverCardsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard, RoleGuard],
      //   //role guard
      //   data: { roles: [UserRoles.Administrator, UserRoles.RetailSupervisor]} },
      {
        path: 'maintenance', component: MaintainComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard, RoleGuard],//role guard
        data: { roles: [UserRoles.Maintenance]}
      }
    ]
  },

  //Layout without sidenav
  {
    path: '',
    component: LayoutWithoutSidenavComponent,
    children: [
      { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard ,BlockGuard] },
      { path: 'pos/blocked', component: DeviceBlockComponent },
      { path: 'pos/lock', component: UserLockComponent },
      { path: 'maintenance/settings', component: PosSettingsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, RoleGuard,BlockGuard], //role guard
        data: { roles: [UserRoles.Maintenance] } },
      { path: 'cashout/popup', component: CashoutPopupComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] }
    ]
  },

  //Single account layout
  {
    path: '',
    component: AccountLayoutComponent,
    children: [
      { path: 'account', component: SingleAccountComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'account/topup', component: TopUpAccountComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/wasel', component: WaselDetailsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      // { path: 'account/penalties', component: AccountPenaltiesComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard]},
      // { path: 'account/penalties/penalty-details', component: AccountPenaltyDetailsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard]},
      { path: 'account/devices', component: AccountDevicesComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'account/payments', component: AccountPaymentsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/payments/details', component: AccPaymentsDetailsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/manage', component: AccountManageComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'account/links', component: AccountLinksComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'account/links/new', component: LinkNewAccountComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/verify', component: AccountVerifyComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/verify/rider', component: AccountRiderComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/verify/new', component: AccountVerifyScratchComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/verify/view', component: AccountVerifyViewComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/tickets', component: AccountTicketsComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/tickets/city', component: AccCityComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'account/tickets/intercity-routes', component: AccIntercityRoutesComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard] },
      { path: 'account/tickets/intercity', component: AccIntercityComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/tickets/all', component: AccTicketsListComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard, BlockGuard]},
      { path: 'account/tickets/period', component: AccountPeriodPassComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/tickets/period/products', component: AccPeriodProductComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/tickets/period/city', component: AccPeriodCityComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard] },
      { path: 'account/manage', component: AccountManageComponent, canActivate: [AuthGuard, CashFloatGuardService, LockGuard,BlockGuard]}
    ]
  },

  //No layout routes
  { path: 'login', component: LoginComponent, canActivate: [LockGuard, BlockGuard] },
  { path: 'login/username', component: LoginUsernameComponent, canActivate: [LockGuard, BlockGuard] },
  { path: 'login/password/:locked', component: LoginPasswordComponent },
  { path: 'new-password', component: NewPasswordComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
