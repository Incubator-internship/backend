export class EmailConfirmation {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
  userId: number;
  static createEmailConfirmation(
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean,
    userId: number,
  ) {
    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.confirmationCode = confirmationCode;
    emailConfirmation.expirationDate = expirationDate;
    emailConfirmation.isConfirmed = isConfirmed;
    emailConfirmation.userId = userId;
    return emailConfirmation;
  }
}
