export interface Hotel {
  name: string;
  address: string;
  distanceToGayArea: string;
  onSiteParking: string; // "FREE" or "$X/night"
  clientParking: string;
  pricePerNight: string;
  mobileKey: boolean;
  breakfast: boolean;
  notes: string;
  whyRecommended: string;
}

export interface StreetMeterInfo {
  location: string;
  rate: string;
  hours: string;
  freeWhen: string;
}

export interface HotelSearchResult {
  city: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  gayArea: string;
  hotels: Hotel[];
  streetMeterInfo: StreetMeterInfo;
}

export interface HotelSearchResponse extends HotelSearchResult {
  timestamp: string; // ISO 8601
  success: boolean;
}
