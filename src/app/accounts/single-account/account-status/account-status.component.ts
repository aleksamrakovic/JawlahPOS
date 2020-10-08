import { Component, OnInit } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { TranslateService, DefaultLangChangeEvent } from '@ngx-translate/core';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-status',
  templateUrl: './account-status.component.html',
  styleUrls: ['./account-status.component.css']
})
export class AccountStatusComponent implements OnInit {
  accountData: any;
  currency: any;
  selectedLang: any;
  hasTopup: boolean = false;
  hasTickets: boolean = false;

  constructor(private accService: AccountServiceService, private posService: PosDataServiceService, private translate: TranslateService) {}

  ngOnInit() {
    this.selectedLang = this.translate.getDefaultLang();
    this.translate.onDefaultLangChange.subscribe((event: DefaultLangChangeEvent) => {
      this.selectedLang = event.lang;
    });

    this.posService.getPosData().subscribe(
      (data: any) => {
        this.currency = data.currencyCode;
        this.hasTickets = data.displayTicketModule;
      });

    //get data using session or using api if no data
    var x = this.accService.getAccountStorage();
    if (!x) {
      this.accService.getAccount().subscribe(
        data => {
          this.accountData = data;
          this.accService.getTopupInfo(this.accountData.riderTypeId).subscribe(
            (res: any) => {
              this.hasTopup = res.exist;
            }
          );
        }
      );
    } else {
      this.accountData = x;
      this.accService.getTopupInfo(this.accountData.riderTypeId).subscribe(
        (res: any) => {
          this.hasTopup = res.exist;
        }
      );
    }
  }
}
