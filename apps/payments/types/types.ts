export type UpdatedSubscriptionDataT = {
  newStart: Date;
  newEnd: Date;
  payIdYoo: string;
};

export type InsertPaymentsUserData = {
  payIdYoo: string;
  status: string;
  amount: string;
  IPaymentMethodData: string;
  subscriptionStart?: Date;
  subscriptionTerm?: string;
  userId: number;
};
