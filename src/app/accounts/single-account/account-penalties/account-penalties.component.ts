import { Component, OnInit } from '@angular/core';
import { AccountServiceService } from '../../account-service.service';
import { Cart, Item } from 'src/app/entities/entitities';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { Router } from '@angular/router';
import { PenaltiesServiceService } from 'src/app/penalties/penalties-service.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-penalties',
  templateUrl: './account-penalties.component.html',
  styleUrls: ['./account-penalties.component.css']
})
export class AccountPenaltiesComponent implements OnInit {
  accountNo: number;
  accountData: any;
  penalties: any[] = [];
  cart: Cart;
  listOpen: any[] = [];
  listAll: any[] = [];
  currency: any;
  selected: any;
  loading: boolean = true;

  constructor(private accService: AccountServiceService, private ticketService: TicketsServiceService, private router: Router, private penService: PenaltiesServiceService, private posService: PosDataServiceService) { }

  ngOnInit() {
    this.posService.getPosData().subscribe((data: any) => { this.currency = data.currencyCode; });
    this.cart = this.ticketService.cart;

    this.accountNo = this.accService.getAccountNo();
    this.accService.getAccountDetails(this.accountNo).subscribe(data => {
      this.loading = false;
      this.accountData = data;
      var penaltyList = [];

      for (let element of this.accountData.penalties) {
        penaltyList.push({
          accountNo: null,
          accountId: null,
          riderType: null,
          cityTicket: null,
          intercityTicket: null,
          productPeriod: null,
          topupAccount: null,
          penalty: element,
          quantity: 0,
          productBaggage: null,
          productBaggageReturn: null,
          routeId: null,
          numberOfPassengers: 0,
        });
      }

      //match penalties from cart
      var cartItems = this.cart.items.filter(el => el.penalty != null);
      for (let cartItem of cartItems) {
        var index = penaltyList.findIndex(x => x.penalty.refNumber === cartItem.penalty.refNumber);
        penaltyList[index] = cartItem;
      }

      //make open/paid list
      for (let i = 0; i < penaltyList.length; i++) {
        if (penaltyList[i].penalty.status.toLowerCase() === 'pending' || penaltyList[i].penalty.status.toLowerCase() === 'in cart') {
          this.listOpen.push(penaltyList[i])
        }
        this.listAll.push(penaltyList[i]);
      }

      //select by default
      var x = {
        source: false,
        value: ''
      }
      this.listOpen.length > 0 ? this.selected = 'open' : this.selected = 'all';
      if (this.listOpen.length > 0) {
        x.value = 'open'
        this.selectType(x)
      } else {
        x.value = 'all'
        this.selectType(x);
      }

    },
    err => {
      this.loading = false;
      this.posService.setAlertMessage('Error occured, please try again later.');
      this.router.navigate(['/account'])
    });
  }

  selectType(event) {
    event.value === 'all' ? this.penalties = this.listAll : this.penalties = this.listOpen;
  }

  seePenalty(item: Item) {
    this.penService.setPenaltyRef(item.penalty.refNumber);
    this.router.navigate(['/account/penalties/penalty-details']);
  }

  addToCart(item: Item) {
    if (this.cart.items.filter(el => el.penalty != null && el.penalty.refNumber === item.penalty.refNumber).length > 0) {
      return
    } else {
      item.quantity = 1;
      item.penalty.status = 'In cart';
      this.cart.items.push(item);
      this.cart.total += item.penalty.value;
    }
    this.ticketService.setCart(this.cart);
  }
}
