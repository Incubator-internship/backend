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
export enum SubscriptionTerm {
  OneDay = '1day',
  SevenDays = '7days',
  Month = 'month',
}

export type DtoProductT = {
  name: string;
  description: string;
  type: string;
  category: string;
  image_url: string;
  home_url: string;
};
