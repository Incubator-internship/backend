export class PasswordRecoveryModel {
  recoveryCode: string;
  recoveryCodeExpireDate: Date;
  alreadyChangePassword: boolean;
  userId: number;
  static createPasswordRecovery(
    userId: number,
    recoveryCode: string,
    recoveryCodeExpireDate: Date,
  ) {
    const passwordRecovery = new PasswordRecoveryModel();
    passwordRecovery.recoveryCode = recoveryCode;
    passwordRecovery.recoveryCodeExpireDate = recoveryCodeExpireDate;
    passwordRecovery.alreadyChangePassword = false;
    passwordRecovery.userId = userId;
    return passwordRecovery;
  }
}
