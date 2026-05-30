export interface CreatePaymentRequest {
  orderId: any;
}

export interface CreatePaymentResponse {
  provider: string;
  paymentUrl: string;
  transactionCode: string;
}

export interface PaymentStatusResponse {
  orderId: any;
  provider: string;
  paymentStatus: string;
  orderStatus: string;
  transactionCode: string;
}
