import { Component, OnInit } from '@angular/core';
import { PenaltiesServiceService } from '../penalties-service.service';
import { Cart, Item } from 'src/app/entities/entitities';
import { TicketsServiceService } from 'src/app/tickets/tickets-service.service';
import { PosDataServiceService } from 'src/app/_service/pos-data-service.service';

@Component({
  selector: 'app-penalty-details',
  templateUrl: './penalty-details.component.html',
  styleUrls: ['./penalty-details.component.css']
})
export class PenaltyDetailsComponent implements OnInit {
  penaltyRef;
  penaltySelected;
  cart: Cart;
  items: Item[] = [];
  currency;
  loading: boolean = false;

  constructor(private posService:PosDataServiceService, private penService: PenaltiesServiceService, private ticketService: TicketsServiceService) { }

  ngOnInit() {
    this.loading = true;
    this.posService.getPosData().subscribe((data: any) => {this.currency = data.currencyCode});
    this.cart = this.ticketService.cart;
    this.penaltyRef = this.penService.getPenaltyRef();

    //call api for penalty details
    this.penService.getPenaltyDetails(this.penaltyRef).subscribe(
      data => {
        this.loading = false;

        this.penaltySelected = {
          accountId: null,
          accountNo: null,
          riderType: null,
          cityTicket: null,
          intercityTicket: null,
          productPeriod: null,
          penalty: data,
          quantity: 1,
          productBaggage: null,
          productBaggageReturn: null,
          routeId: null,
          topupAccount: null,
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

    );
  }

  removeFromCart(item: Item) {
    if (this.cart.items.filter(el => el.penalty.refNumber === item.penalty.refNumber).length > 0) {
      var index = this.cart.items.indexOf(item);
      if (index > -1) {
        item.quantity = 0;
        item.penalty.status = 'Open';
        this.cart.total -= item.penalty.value;
        this.cart.items.splice(index, 1);
      }
    }
    this.ticketService.setCart(this.cart);
  }

}
