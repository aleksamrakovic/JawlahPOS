import { Identifiers } from '@angular/compiler';

export class Cart {
  items: Item[];
  total: number;
  totalCent: number;
  posId: string;
  currency: string;
  paymentType: number;
  transactionNo: string;
}

export class Item {
  accountId: string;
  accountNo: number;
  riderType: RiderType;
  cityTicket: CityTicket;
  intercityTicket: IntercityTicket;
  productPeriod: ProductPeriod;
  topupAccount: TopupAccount;
  penalty: Penalty;
  quantity: number;
  productBaggage: ProductBaggage;
  productBaggageReturn: ProductBaggage;
  numberOfPassengers: number;
  routeId: number;
}

export class CityTicket {
  id: number;
  name: string;
  nameTranslated: string;
  price: number;
  priceCent: number;
  zoneTraveled: string;
  route: string;
  routeTranslated: string;
}

export class IntercityTicket {
  id: string;
  price: number;
  priceCent: number;
  priceReturn: number;
  isReturn: boolean;
  busStopFromName: BusStop;
  busStopToName: BusStop;
  busStopFromCode: string;
  busStopToCode: string;
  busStationFromCode: string;
  busStationToCode: string;
  priceBaggage: number;
  busStationFromName: string;
  busStationFromNameTranslate: string;
  busStationToName: string;
  busStationToNameTranslate: string;
}

export class ProductBaggage {
  id: string;
  price: number;
  priceCent: number;
  name: string;
  nameTranslated: string;
  isIntercityTicket: boolean;
}

export class ProductPeriod {
  id: number;
  price: number;
  priceCent: number;
  name: string;
  nameTranslated: string;
  route: string;
  routeTranslated: string;
}

export class BusStop {
  id: number;
  name: string;
}

export class RiderType {
  id: number;
  name: string
  externalId: number;
  isGroup: boolean;
  nameTranslated: string;
}

export class Penalty {
  refNumber: string;
  value: number;
  status: string;
}

export class TopupAccount {
  id: number;
  name: string;
  value: number;
  accountNo: string;
}

export enum UserRoles {
  CSA = 201,
  Maintenance = 202,
  RetailSupervisor = 206,
  Administrator = 207
}

export enum DeviceCounter {
  printer = 1,
  smartcard = 4,
  scanner = 5,
  scannerErr = 6
}
