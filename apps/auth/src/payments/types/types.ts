export type DatateT = {
  userId: number;
  type: string;
  term: string;
  amount: string;
  nextPayment: string;
};

export type UpcomingPaymentT = {
  userId: number;
  daysUntilExpiry: number;
};
