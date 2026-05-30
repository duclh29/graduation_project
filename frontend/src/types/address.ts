export interface Address {
  id: number;
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city: string;
  country?: string;
  postalCode?: string;
}

