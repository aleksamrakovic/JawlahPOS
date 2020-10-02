import { Injectable } from '@angular/core';
import { TicketsServiceService } from '../tickets/tickets-service.service';
import { PosDataServiceService } from './pos-data-service.service';

@Injectable({
  providedIn: 'root'
})
export class PrintServiceService {
  translations = new Map<string, string>();
  currency;
  currencyDecimal;

  constructor(private ticketService: TicketsServiceService, private posService: PosDataServiceService) {
    this.posService.getPosData().subscribe((data: any) => {
      this.currency = data.currencyCode;
      this.currencyDecimal = data.currencyDecimal;
    });

    this.ticketService.getTranslation().subscribe(res => {
      for (let i = 0; i < res.length; i++) {
        this.translations.set(res[i].item, res[i].translation);
      }
    });
  }

  printCityTicket(item) {
    var text = '';
    let riderEn = item.riderType.name;
    let riderAr = item.riderType.nameTranslated;
    let routeEn = item.cityTicket.name;
    let routeAr = item.cityTicket.nameTranslated;
    let itemPrice = item.cityTicket.price.toFixed(this.currencyDecimal);
    let newPrice = this.formatArabicNum(itemPrice);

    if (!riderAr || !routeAr) {
      //dugacko
      if (riderEn.length > 16 || routeEn.length > 16) {
        text +=
          `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${routeEn}`, 24)}\n` +
          `${this.addSpace(`Price`, 24)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 24)}\n`
      }
      //ok duzina
      else {
        text += `${this.addSpace(`${riderEn}`, 16)}` + `${this.addSpace3(`${routeEn}`, 16)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 16)}\n`;
      }
    } else {
      if (riderEn.length > 16 || routeEn.length > 16 || riderAr.length > 16 || routeAr.length > 16) {
        //dve kolone za eng
        text +=
          `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${routeEn}`, 24)}\n` +
          `${this.addSpace(`Price`, 24)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 24)}\n`;
        //dve kolone za arapski
        text += `${this.addSpace(`${newPrice} ${this.translations.get(this.currency)}`, 48)}\n`;
        text += `${this.addSpace(`${routeAr}`, 24)}` + `${this.addSpace2(`${riderAr}`, 24)}\n`;
      } else {
        text +=
          `${this.addSpace(`${riderAr}`, 16)}` + `${this.addSpace3(`${routeAr}`, 16)}` + `${this.addSpace2(`${newPrice} ${this.translations.get(this.currency)}`, 16)}\n` +
          `${this.addSpace(`${riderEn}`, 16)}` + `${this.addSpace3(`${routeEn}`, 16)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 16)}\n`;
      }
    }

    return text;
  }

  //TODO: period ticket
  printPeriodTicket(item) {
    var text = '';
    let riderEn = item.riderType.name;
    let riderAr = item.riderType.nameTranslated;
    let routeEn = item.productPeriod.name;
    let routeAr = item.productPeriod.nameTranslated;
    let itemPrice = item.productPeriod.price.toFixed(this.currencyDecimal);
    let newPrice = this.formatArabicNum(itemPrice);

    if (!riderAr || !routeAr) {
      //dugacko
      if (riderEn.length > 16 || routeEn.length > 16) {
        text +=
          `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${routeEn}`, 24)}\n` +
          `${this.addSpace(`Price`, 24)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 24)}\n`
      }
      //ok duzina
      else {
        text += `${this.addSpace(`${riderEn}`, 16)}` + `${this.addSpace3(`${routeEn}`, 16)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 16)}\n`;
      }
    } else {
      if (riderEn.length > 16 || routeEn.length > 16 || riderAr.length > 16 || routeAr.length > 16) {
        //dve kolone za eng
        text +=
          `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${routeEn}`, 24)}\n` +
          `${this.addSpace(`Price`, 24)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 24)}\n`;
        //dve kolone za arapski
        text += `${this.addSpace(`${newPrice} ${this.translations.get(this.currency)}`, 48)}\n`;
        text += `${this.addSpace(`${routeAr}`, 24)}` + `${this.addSpace2(`${riderAr}`, 24)}\n`;
      } else {
        text +=
          `${this.addSpace(`${riderAr}`, 16)}` + `${this.addSpace3(`${routeAr}`, 16)}` + `${this.addSpace2(`${newPrice} ${this.translations.get(this.currency)}`, 16)}\n` +
          `${this.addSpace(`${riderEn}`, 16)}` + `${this.addSpace3(`${routeEn}`, 16)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 16)}\n`;
      }
    }

    return text;
  }

  printLuggage(item) {
    var text = '';
    let lugg = 'Additional Luggage';
    let luggAr = this.translations.get(lugg);
    let name = item.productBaggage.name;
    let nameAr = item.productBaggage.nameTranslated;

    let price = item.productBaggage.price.toFixed(this.currencyDecimal);
    let priceAr = this.formatArabicNum(price);

    if (!nameAr || !luggAr) {
      if ((name.length + lugg.length) > 33) {
        text += `${this.addSpace(`${lugg} ${name}`, 48)}`;
        text += `${this.addSpace(`${price} ${this.currency}`, 48)}\n`;
      } else {
        text += `${this.addSpace(`${lugg} ${name}`, 33)}` + `${this.addSpace2(`${price} ${this.currency}`, 15)}`;
      }
    }
    //ar
    else {
      if ((name.length + lugg.length) > 33 || (nameAr.length + luggAr.length) > 33) {
        //ar
        text += `${this.addSpace(`${luggAr} ${nameAr}`, 48)}`;
        text += `${this.addSpace(`${priceAr} ${this.translations.get(this.currency)}`, 48)}\n`;

        //en
        text += `${this.addSpace(`${lugg} ${name}`, 48)}`;
        text += `${this.addSpace(`${price} ${this.currency}`, 48)}\n`;
      }
      //fit
      else {
        //ar
        text += `${this.addSpace(`${luggAr} ${nameAr}`, 33)}` + `${this.addSpace2(`${priceAr} ${this.translations.get(this.currency)}`, 15)}\n`
        //en
        text += `${this.addSpace(`${lugg} ${name}`, 33)}` + `${this.addSpace2(`${price} ${this.currency}`, 15)}\n`;
      }

    }

    return text;
  }


  printLuggageReturn(item) {
    var text = '';
    let lugg = 'Additional Luggage';
    let luggAr = this.translations.get(lugg);
    let name = item.productBaggageReturn.name;
    let nameAr = item.productBaggageReturn.nameTranslated;

    let price = item.productBaggageReturn.price.toFixed(this.currencyDecimal);
    let priceAr = this.formatArabicNum(price);

    if (!nameAr || !luggAr) {
      if ((name.length + lugg.length) > 33) {
        text += `${this.addSpace(`${lugg} ${name}`, 48)}`;
        text += `${this.addSpace(`${price} ${this.currency}`, 48)}\n`;
      } else {
        text += `${this.addSpace(`${lugg} ${name}`, 33)}` + `${this.addSpace2(`${price} ${this.currency}`, 15)}`;
      }
    }
    //ar
    else {
      if ((name.length + lugg.length) > 33 || (nameAr.length + luggAr.length) > 33) {
        //ar
        text += `${this.addSpace(`${luggAr} ${nameAr}`, 48)}`;
        text += `${this.addSpace(`${priceAr} ${this.translations.get(this.currency)}`, 48)}\n`;

        //en
        text += `${this.addSpace(`${lugg} ${name}`, 48)}`;
        text += `${this.addSpace(`${price} ${this.currency}`, 48)}\n`;
      }
      //fit
      else {
        //ar
        text += `${this.addSpace(`${luggAr} ${nameAr}`, 33)}` + `${this.addSpace2(`${priceAr} ${this.translations.get(this.currency)}`, 15)}\n`
        //en
        text += `${this.addSpace(`${lugg} ${name}`, 33)}` + `${this.addSpace2(`${price} ${this.currency}`, 15)}\n`;
      }

    }

    return text;
  }

  //TODO: complete intercity receipt
  printIntercity(item, k) {

    var str = ' ';
    var text = '';
    let riderEn = item.riderType.name;
    let riderAr = this.translations.get(riderEn);
    let stopFrom = item.intercityTicket.busStationFromName;
    let stopFromAr = item.intercityTicket.busStationFromNameTranslate;
    let stopTo = item.intercityTicket.busStationToName;
    let stopToAr = item.intercityTicket.busStationToNameTranslate;

    let routeEn = stopFrom + "-" + stopTo;
    let routeAr = stopFromAr + "-" + stopToAr;

    let firstTrip = 'Return ticket - 1st trip';
    let firstTripAr = this.translations.get(firstTrip);
    let secondTrip = 'Return ticket - 2nd trip';
    let secondTripAr = this.translations.get(secondTrip);

    if (k == 1) {
      //intercity return
      routeEn = stopTo + "-" + stopFrom;
      routeAr = stopToAr + "-" + stopFromAr;
    };

    let itemPrice;
    if (item.intercityTicket.isReturn) {
      itemPrice = item.intercityTicket.priceReturn.toFixed(this.currencyDecimal);
    } else {
      itemPrice = item.intercityTicket.price.toFixed(this.currencyDecimal);
    }
    let newPrice = this.formatArabicNum(itemPrice);

    if (!riderAr || !routeAr) {
      //Bez ar
      //dugacko
      if (riderEn.length > 16 || routeEn.length > 16) {
        text +=
          `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 24)}\n` +
          `${this.addSpace(`${routeEn}`, 48)}\n`;
      }
      // ok duzina
      else {
        text += `${this.addSpace(`${riderEn}`, 16)}` +
          `${this.addSpace3(`${routeEn}`, 16)}` +
          `${this.addSpace2(`${itemPrice} ${this.currency}`, 16)}\n`;
      }
    } else {
      //sa ar
      if (riderEn.length > 16 || routeEn.length > 24 || riderAr.length > 16 || routeAr.length > 24) {
        //dve kolone za arapski
        text +=
          `${this.addSpace(`${riderAr}`, 24)}` + `${this.addSpace2(`${newPrice} ${this.translations.get(this.currency)}`, 24)}\n`;
        text += `${this.addSpace(`${routeAr}`, 48)}\n`;

        //1st or 2nd trip translate
        if (k == 0 && item.intercityTicket.isReturn && firstTripAr) {
          text += `${this.addSpace3(`${firstTripAr}`, 48)}\n`;
        } else if (k == 1 && item.intercityTicket.isReturn && secondTripAr) {
          text += `${this.addSpace3(`${secondTripAr}`, 48)}\n`;
        }


        text +=
          //dve kolone eng
          `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 24)}\n` +
          `${this.addSpace(`${routeEn}`, 48)}\n`;

        //1st or 2nd trip translate
        if (k == 0 && item.intercityTicket.isReturn) {
          text += `${this.addSpace3(`${firstTrip}`, 48)}\n`;
        } else if (k == 1 && item.intercityTicket.isReturn) {
          text += `${this.addSpace3(`${secondTrip}`, 48)}\n`;
        }

      } else {

        text +=
          `${this.addSpace(`${riderAr}`, 12)}` + `${this.addSpace3(`${routeAr}`, 24)}` + `${this.addSpace2(`${newPrice} ${this.translations.get(this.currency)}`, 12)}\n`;

        //1st or 2nd trip translate
        if (k == 0 && item.intercityTicket.isReturn && firstTripAr) {
          text += `${this.addSpace3(`${firstTripAr}`, 48)}\n`;
        } else if (k == 1 && item.intercityTicket.isReturn && secondTripAr) {
          text += `${this.addSpace3(`${secondTripAr}`, 48)}\n`;
        }

        text +=
          `${this.addSpace(`${riderEn}`, 12)}` + `${this.addSpace3(`${routeEn}`, 24)}` + `${this.addSpace2(`${itemPrice} ${this.currency}`, 12)}\n`;

        //1st or 2nd trip translate
        if (k == 0 && item.intercityTicket.isReturn) {
          text += `${this.addSpace3(`${firstTrip}`, 48)}\n`;
        } else if (k == 1 && item.intercityTicket.isReturn) {
          text += `${this.addSpace3(`${secondTrip}`, 48)}\n`;
        }
      }
    }

    return text;
  }

  addCityReceipt(ele) {
    let cityPrice = (ele.cityTicket.price * ele.quantity).toFixed(this.currencyDecimal);
    let cityVal = this.formatArabicNum(cityPrice);
    let riderEn = ele.riderType.name;
    let riderAr = ele.riderType.nameTranslated;
    let nameEn = ele.cityTicket.name;
    let nameAr = ele.cityTicket.nameTranslated;
    let routeEn = ele.cityTicket.route;
    let routeAr = ele.cityTicket.routeTranslated;
    let totalRec = '';
    let str = ' ';
    let curr = this.currency;

    let groupPrice = (ele.cityTicket.price * ele.numberOfPassengers).toFixed(this.currencyDecimal);
    let groupPriceAr = this.formatArabicNum(groupPrice);

    let group = 'Group ticket';
    let groupAr = this.translations.get(group);
    let passenger = 'Passenger';
    let passengerAr = this.translations.get(passenger);

    //check if ticket is group
    if (ele.riderType.isGroup) {
      //check group ar
      if (!groupAr) {
        totalRec += `${this.addSpace(`${group}`, 24)}` + `${this.addSpace2(`${groupPrice} ${curr}`, 24)}\n`;
      } else {
        if (group.length > 16 || groupAr.length > 16 || groupPrice.length > 14) {
          totalRec += `${this.addSpace(`${group}`, 24)}` + `${this.addSpace2(`${groupPrice} ${curr}`, 24)}\n`;
          totalRec += `${this.addSpace(`${str.repeat(2)}${groupPriceAr}${curr}${groupAr}`, 48)}\n`;
        } else {
          totalRec +=
            `${this.addSpace(`${group}${str.repeat(2)}${groupPriceAr}${str.repeat((16 - group.length) + (14 - (groupPriceAr.length + curr.length)) / 2)}${curr}${groupAr}`, 48)}\n`;
        }
      }

      //check no ticket ar
      let noTicket = 'Quantity'
      let noTick = ele.quantity.toString();
      if (!passengerAr) {
        totalRec += `${this.addSpace(`${noTicket} ${noTick}`, 48)}\n`;
      } else {
        totalRec +=
          `${this.addSpace(`${noTicket}${passengerAr}${str.repeat((16 - passengerAr.length) + (16 - noTick.length) / 2)}${noTick}`, 48)}\n`;
      }

      //check passenger ar
      let noPass = ele.numberOfPassengers.toString();
      if (!passengerAr) {
        totalRec += `${this.addSpace(`${noPass} ${passenger}`, 48)}\n`;
      } else {
        totalRec +=
          `${this.addSpace(`${passenger}${passengerAr}${str.repeat((16 - passengerAr.length) + (16 - noPass.length) / 2)}${noPass}`, 48)}\n`;
      }

      //check rider translation
      if (!riderAr) {
        totalRec += `${this.addSpace(`${riderEn}`, 48)}\n`;
      } else {
        if (riderEn.length > 24 || riderAr.length > 24) {
          totalRec += `${this.addSpace(`${riderEn}`, 48)}\n`;
          totalRec += `${this.addSpace(`${riderAr}`, 48)}\n`;
        } else {
          totalRec += `${this.addSpace(`${riderEn} ${riderAr}`, 48)}\n`;
        }
      }
    }

    //if not group
    else {
      //check rider translation
      if (!riderAr) {
        totalRec += `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${cityPrice} ${curr}`, 24)}\n`;
      } else {
        if (riderEn.length > 16 || riderAr.length > 16 || cityVal.length > 14) {
          totalRec += `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${cityPrice} ${curr}`, 24)}\n`;
          totalRec += `${this.addSpace(`${str.repeat(2)}${cityVal}${curr}${riderAr}`, 48)}\n`;
        } else {
          totalRec +=
            `${this.addSpace(`${riderEn}${str.repeat(2)}${cityVal}${str.repeat((16 - riderEn.length) + (14 - (cityVal.length + curr.length)) / 2)}${curr}${riderAr}`, 48)}\n`;
        }
      }
    }

    //check route translation
    if (!routeAr || !nameAr) {
      totalRec += `${this.addSpace(`${nameEn} ${routeEn}`, 48)}\n`;
    } else {
      if ((nameEn.length + routeEn.length) > 24 || (nameAr.lenght + routeAr.length) > 24) {
        totalRec += `${this.addSpace(`${nameEn} ${routeEn}`, 48)}\n`;
        totalRec += `${this.addSpace(`${nameAr} ${routeAr}`, 48)}\n`;
      } else {
        totalRec += `${this.addSpace(`${nameEn} ${routeEn} ${nameAr} ${routeAr}`, 48)}\n`;
      }
    }

    return totalRec;
  }

  addIntercityReceipt(ele) {
    let price;
    if (ele.intercityTicket.isReturn) {
      price = (ele.intercityTicket.priceReturn * ele.quantity).toFixed(this.currencyDecimal)
    } else {
      price = (ele.intercityTicket.price * ele.quantity).toFixed(this.currencyDecimal)
    }
    let priceAr = this.formatArabicNum(price);
    let riderEn = ele.riderType.name;
    let riderAr = ele.riderType.nameTranslated;

    let stopFrom = ele.intercityTicket.busStationFromName;
    let stopFromAr = ele.intercityTicket.busStationFromNameTranslate;
    let stopTo = ele.intercityTicket.busStationToName;
    let stopToAr = ele.intercityTicket.busStationToNameTranslate;

    let routeEn = stopFrom + "-" + stopTo;
    let routeAr = stopFromAr + "-" + stopToAr;
    let totalRec = '';
    let str = ' ';
    let curr = this.currency;

    let groupPrice;
    if (ele.intercityTicket.isReturn && ele.riderType.isGroup) {
      groupPrice = (ele.intercityTicket.priceReturn * ele.numberOfPassengers).toFixed(this.currencyDecimal);
    } else {
      groupPrice = (ele.intercityTicket.price * ele.numberOfPassengers).toFixed(this.currencyDecimal)
    }
    let groupPriceAr = this.formatArabicNum(groupPrice);

    let group = 'Group ticket';
    let groupAr = this.translations.get(group);
    let passenger = 'Passenger';
    let passengerAr = this.translations.get(passenger);

    //if group
    if (ele.riderType.isGroup) {
      //check group ar
      if (!groupAr) {
        totalRec += `${this.addSpace(`${group}`, 24)}` + `${this.addSpace2(`${groupPrice} ${curr}`, 24)}\n`;
      } else {
        if (group.length > 16 || groupAr.length > 16 || groupPrice.length > 14) {
          totalRec += `${this.addSpace(`${group}`, 24)}` + `${this.addSpace2(`${groupPrice} ${curr}`, 24)}\n`;
          totalRec += `${this.addSpace(`${str.repeat(2)}${groupPriceAr}${curr}${groupAr}`, 48)}\n`;
        } else {
          totalRec +=
            `${this.addSpace(`${group}${str.repeat(2)}${groupPriceAr}${str.repeat((16 - group.length) + (14 - (groupPriceAr.length + curr.length)) / 2)}${curr}${groupAr}`, 48)}\n`;
        }
      }

      //check no ticket ar
      //missing right name
      let noTicket = 'Quantity'
      let noTick = ele.quantity.toString();
      if (!passengerAr) {
        totalRec += `${this.addSpace(`${noTicket} ${noTick}`, 48)}\n`;
      } else {
        totalRec +=
          `${this.addSpace(`${noTicket}${passengerAr}${str.repeat((16 - passengerAr.length) + (16 - noTick.length) / 2)}${noTick}`, 48)}\n`;
      }

      //check passenger ar
      let noPass = ele.numberOfPassengers.toString();
      if (!passengerAr) {
        totalRec += `${this.addSpace(`${noPass} ${passenger}`, 48)}\n`;
      } else {
        totalRec +=
          `${this.addSpace(`${passenger}${passengerAr}${str.repeat((16 - passengerAr.length) + (16 - noPass.length) / 2)}${noPass}`, 48)}\n`;
      }

      //check rider translation
      if (!riderAr) {
        totalRec += `${this.addSpace(`${riderEn}`, 48)}\n`;
      } else {
        if (riderEn.length > 24 || riderAr.length > 24) {
          totalRec += `${this.addSpace(`${riderEn}`, 48)}\n`;
          totalRec += `${this.addSpace(`${riderAr}`, 48)}\n`;
        } else {
          totalRec += `${this.addSpace(`${riderEn} ${riderAr}`, 48)}\n`;
        }
      }
    }

    //not group
    else {
      //check rider translation
      if (!riderAr) {
        totalRec +=
          `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${price} ${curr}`, 24)}\n`;
      } else {
        if (riderEn.length > 16 || riderAr.length > 16) {
          totalRec += `${this.addSpace(`${str.repeat(2)}${priceAr}${curr}${riderAr}`, 48)}\n`;
          totalRec += `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${price} ${curr}`, 24)}\n`;
        }
        totalRec +=
          `${this.addSpace(`${riderEn}${str.repeat(2)}${priceAr}${str.repeat((16 - riderEn.length) + (14 - (priceAr.length + curr.length)) / 2)}${curr}${riderAr}`, 48)}\n`;
      }

    }

    //route translation
    if (!routeAr) {
      totalRec += `${this.addSpace(`${routeEn}`, 48)}\n`;
    } else {
      if (routeEn.length > 24 || routeAr.length > 24) {
        totalRec += `${this.addSpace(`${routeEn}`, 48)}\n`;
        totalRec += `${this.addSpace(`${routeAr}`, 48)}\n`;
      } else {
        totalRec += `${this.addSpace(`${routeEn} ${routeAr}`, 48)}\n`;
      }
    }

    return totalRec;
  }

  addLuggageReceipt(ele) {
    var text = '';
    let str = ' ';
    let name = ele.productBaggage.name;
    let nameAr = ele.productBaggage.nameTranslated;
    let price = ele.productBaggage.price.toFixed(this.currencyDecimal);
    let priceAr = this.formatArabicNum(price);
    let curr = this.currency;

    if (!nameAr) {
      if (name.length > 24) {
        text += `${this.addSpace(`${name}`, 48)}`;
        text += `${this.addSpace(`${price} ${curr}`, 48)}\n`;
      } else {
        text += `${this.addSpace(`${name}`, 24)}` + `${this.addSpace2(`${price} ${curr}`, 24)}`;
      }
    }
    //ar
    else {
      if (name.length > 16 || nameAr.length > 16) {
        //ar
        text += `${this.addSpace(`${nameAr}`, 24)}` + `${this.addSpace2(`${priceAr} ${this.translations.get(curr)}`, 24)}\n`;
        //en
        text += `${this.addSpace(`${name}`, 24)}` + `${this.addSpace2(`${price} ${curr}`, 24)}\n`;
      }
      else {
        //ar
        text +=
          `${this.addSpace(`${name}${str.repeat(2)}${priceAr}${str.repeat((16 - name.length) + (14 - (priceAr.length + curr.length)) / 2)}${curr}${nameAr}`, 48)}\n`;
      }
    }

    return text;
  }


  addLuggageReturnReceipt(ele) {
    var text = '';
    let str = ' ';
    let name = ele.productBaggageReturn.name;
    let nameAr = ele.productBaggageReturn.nameTranslated;
    let price = ele.productBaggageReturn.price.toFixed(this.currencyDecimal);
    let priceAr = this.formatArabicNum(price);
    let curr = this.currency;


    if (!nameAr) {
      if (name.length > 24) {
        text += `${this.addSpace(`${name}`, 48)}`;
        text += `${this.addSpace(`${price} ${curr}`, 48)}\n`;
      } else {
        text += `${this.addSpace(`${name}`, 24)}` + `${this.addSpace2(`${price} ${curr}`, 24)}`;
      }
    }
    //ar
    else {
      if (name.length > 16 || nameAr.length > 16) {
        //ar
        text += `${this.addSpace(`${nameAr}`, 24)}` + `${this.addSpace2(`${priceAr} ${this.translations.get(curr)}`, 24)}\n`;
        //en
        text += `${this.addSpace(`${name}`, 24)}` + `${this.addSpace2(`${price} ${curr}`, 24)}\n`;
      }
      else {
        //ar
        text +=
          `${this.addSpace(`${name}${str.repeat(2)}${priceAr}${str.repeat((16 - name.length) + (14 - (priceAr.length + curr.length)) / 2)}${curr}${nameAr}`, 48)}\n`;
      }
    }

    return text;
  }

  addPenaltyReceipt(ele) {
    let penEn = 'Penalty payment';
    let penAr = this.translations.get(penEn);
    let penRefEn = 'Penalty reference';
    let penRefAr = this.translations.get(penRefEn);
    let penValue = ele.penalty.value.toFixed(this.currencyDecimal);
    let penValAr = this.formatArabicNum(penValue);
    let penRef = ele.penalty.refNumber;
    let text = '';
    var curr = this.currency;
    var underline = `_`;
    var str = ' ';

    //check pen translation
    if (!penAr || !penRefAr) {
      text +=
        `${this.addSpace(`${penEn}`, 24)}` + `${this.addSpace2(`${penValue} ${curr}`, 24)}\n` +
        `${this.addSpace(`${penRefEn}`, 24)}` + `${this.addSpace2(`${penRef}`, 24)}\n`;
    } else {
      if (penEn.length > 16 || penAr.length > 16 || penValAr.length > 10 || penRefEn.length > 16 || penRefAr.length > 16 || penRef.length > 16) {
        console.log('dugacko');

        text +=
          `${this.addSpace(`${penEn}`, 24)}` + `${this.addSpace2(`${penValue} ${curr}`, 24)}\n` +
          `${this.addSpace(`${penRefEn}`, 24)}` + `${this.addSpace2(`${penRef}`, 24)}\n`;
        //ar
        text +=
          `${this.addSpace(`${str.repeat(2)}${penValAr}${curr}${penAr}`, 48)}\n` +
          `${this.addSpace(`${penRefAr}${str.repeat((24 - penRefAr.length) + (24 - penRef.length))}${penRef}`, 48)}\n\n`;
      } else {
        text +=
          `${this.addSpace(`${penEn}${str.repeat(2)}${penValAr}${str.repeat((16 - penEn.length) + (14 - (penValAr.length + curr.length)) / 2)}${curr}${penAr}`, 48)}\n` +
          `${this.addSpace(`${penRefEn}${penRefAr}${str.repeat((16 - penRefAr.length) + (16 - penRef.length) / 2)}${penRef}`, 48)}\n\n`;
      }
    }
    return text;
  }

  addTopupReceipt(ele) {
    let itemPrice = ele.topupAccount.value.toFixed(this.currencyDecimal);
    let newPrice = this.formatArabicNum(itemPrice);
    let en = 'Account top up';
    let ar = this.translations.get('Account top up');
    let totalRec = '';
    let str = ' ';
    let curr = this.currency;

    if (!ar) {
      totalRec += `${this.addSpace(`${en}`, 24)}` + `${this.addSpace2(`${itemPrice} ${curr}`, 24)}\n`;
    } else {
      if (en.length > 16 || ar.length > 16 || newPrice.length > 10) {
        totalRec += `${this.addSpace(`${en}`, 24)}` + `${this.addSpace2(`${itemPrice} ${curr}`, 24)}\n`;
        totalRec += `${this.addSpace(`${str.repeat(2)}${newPrice}${curr}${ar}`, 48)}\n\n`;
      } else {
        totalRec += `${this.addSpace(`${en}${str.repeat(2)}${newPrice}${str.repeat((16 - en.length) + (14 - (newPrice.length + curr.length)) / 2)}${curr}${ar}`, 48)}\n`;
      }
    }
    return totalRec;
  }

  addProductPeriodReceipt(ele) {
    let productPrice = (ele.productPeriod.price * ele.quantity).toFixed(this.currencyDecimal);
    let productPriceAr = this.formatArabicNum(productPrice);
    let riderEn = ele.riderType.name;
    let riderAr = ele.riderType.nameTranslated;
    let nameEn = ele.productPeriod.name;
    let nameAr = ele.productPeriod.nameTranslated;
    let routeEn = ele.productPeriod.route;
    let routeAr = ele.productPeriod.routeTranslated;
    let totalRec = '';
    let str = ' ';
    let curr = this.currency;

    //check rider translation
    if (!riderAr) {
      totalRec += `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${productPrice} ${curr}`, 24)}\n`;
    } else {
      if (riderEn.length > 16 || riderAr.length > 16 || productPriceAr.length > 14) {
        totalRec += `${this.addSpace(`${riderEn}`, 24)}` + `${this.addSpace2(`${productPrice} ${curr}`, 24)}\n`;
        totalRec += `${this.addSpace(`${str.repeat(2)}${productPriceAr}${curr}${riderAr}`, 48)}\n`;
      } else {
        totalRec +=
          `${this.addSpace(`${riderEn}${str.repeat(2)}${productPriceAr}${str.repeat((16 - riderEn.length) + (14 - (productPriceAr.length + curr.length)) / 2)}${curr}${riderAr}`, 48)}\n`;
      }
    }

    //check route translation
    if (!routeAr || !nameAr) {
      totalRec += `${this.addSpace(`${nameEn} ${routeEn}`, 48)}\n`;
    } else {
      if ((nameEn.length + routeEn.length) > 24 || (nameAr.lenght + routeAr.length) > 24) {
        totalRec += `${this.addSpace(`${nameEn} ${routeEn}`, 48)}\n`;
        totalRec += `${this.addSpace(`${nameAr} ${routeAr}`, 48)}\n`;
      } else {
        totalRec += `${this.addSpace(`${nameEn} ${routeEn} ${nameAr} ${routeAr}`, 48)}\n`;
      }
    }

    return totalRec;
  }

  formatArabicNum(num) {
    var arPrice = num.split(".");
    var newPrice;
    arPrice.length < 2 ? newPrice = arPrice[0] : newPrice = arPrice[1] + '.' + arPrice[0];
    return newPrice;
  }

  //add space after
  addSpace(string = '', validLength = 0) {
    if (string.length < validLength) {
      var spaces = validLength - string.length;
      for (var i = 1; i <= spaces; i++) {
        string = string + ' ';
      }
    } else {
      return string
    }
    return string;
  }

  //add space before
  addSpace2(string = '', validLength = 0) {
    if (string.length < validLength) {
      var spaces = validLength - string.length;
      for (var i = 1; i <= spaces; i++) {
        string = ' ' + string;
      }
    } else {
      return string
    }
    return string;
  }

  //add space both side
  addSpace3(string = '', validLength = 0) {
    if (string.length < validLength) {
      var spaces = Math.floor((validLength - string.length) / 2);
      for (var i = 1; i <= spaces; i++) {
        string = ' ' + string + ' ';
      }
    } else {
      return string
    }
    return string;
  }
}
