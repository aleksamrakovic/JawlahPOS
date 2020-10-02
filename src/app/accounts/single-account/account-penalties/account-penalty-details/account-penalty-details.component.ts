import { Component, OnInit } from '@angular/core';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { PenaltiesServiceService } from 'src/app/penalties/penalties-service.service';
import { Item } from 'src/app/entities/entitities';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-account-penalty-details',
  templateUrl: './account-penalty-details.component.html',
  styleUrls: ['./account-penalty-details.component.css']
})
export class AccountPenaltyDetailsComponent implements OnInit {
  cart;
  penaltyRef: number;
  penaltySelected: any;
  currency: string;
  loading: boolean = false;

  constructor(private posService: PosDataServiceService,private ticketService: TicketsServiceService, private penService: PenaltiesServiceService) { }

  ngOnInit() {
    this.loading = true;

    //currency data
    this.posService.getPosData().subscribe((data: any) => {this.currency = data.currencyCode;});
    this.cart = this.ticketService.cart;
    this.penaltyRef = this.penService.getPenaltyRef();

    //get penalty details from api
    this.penService.getPenaltyDetails(this.penaltyRef).subscribe(
      data => {
        this.loading = false;

        this.penaltySelected = {
          accountNo: null,
          accountId: null,
          riderType: null,
          cityTicket: null,
          intercityTicket: null,
          productPeriod: null,
          topupAccount: null,
          penalty: data,
          quantity: 0,
          productBaggage: null,
          productBaggageReturn: null,
          routeId: null,
          numberOfPassengers: 0,
        };
        console.log(this.penaltySelected);

        var cartItems = this.cart.items.filter(el => el.penalty != null);
        for (let cartItem of cartItems) {
          var index = this.cart.items.findIndex(x => x.penalty.refNumber === cartItem.penalty.refNumber);
          this.penaltySelected = cartItems[index];
        }
      },
      err => {
        this.loading = false;
      }
    )
  }

  removeFromCart(item: Item) {
    if (this.cart.items.filter(el => el.penalty != null && el.penalty.refNumber === item.penalty.refNumber).length > 0) {
      item.quantity = 0;
      item.penalty.status = 'Open';
      var index = this.cart.items.indexOf(item);
      if (index > -1) {
        this.cart.items.splice(index, 1);
        this.cart.total -= item.penalty.value;
      }
      this.ticketService.setCart(this.cart);
    }
  }
}
