export interface OrderInvoiceEvent {
  orderId: string;
  invoiceId: string;
  status: 'CREATED' | 'UPDATED' | 'DELETED';
}

export interface OrderCreatedPayload {
  orderId: string;
  customerId: string;
  sellerId: string;
}

export interface InvoiceUploadedPayload {
  invoiceId: string;
  orderId: string;
}

export interface InvoiceSendPayload {
  invoiceId: string;
  orderId: string;
}

export interface InvoiceSentPayload {
  invoiceId: string;
  orderId: string;
  sentAt: Date;
}

export const OrderInvoiceEvents = {
  ORDER_CREATED: 'ORDER_CREATED',
  INVOICE_UPLOADED: 'INVOICE_UPLOADED',
  INVOICE_SEND: 'INVOICE_SEND',
  INVOICE_SENT: 'INVOICE_SENT',
} as const;

export type OrderInvoiceEventType = keyof typeof OrderInvoiceEvents;
