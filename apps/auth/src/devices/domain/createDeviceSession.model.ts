// export class Session {
//   constructor(
//     public deviceId: string,
//     public ip: string,
//     public deviceName: string,
//     public userId: number,
//     public issuedAt: string,
//   ) {}
// }
export class SessionModel {
  deviceId: string;
  ip: string;
  deviceName: string;
  userId: number;
  issuedAt: string;
  timezone: string;
  constructor() {}
  static createDeviceSession(
    deviceId: string,
    ip: string,
    deviceName: string,
    userId: number,
    issuedAt: string,
    timezone: string,
  ) {
    const session = new this();
    session.deviceId = deviceId;
    session.ip = ip;
    session.deviceName = deviceName;
    session.userId = userId;
    session.issuedAt = issuedAt;
    session.timezone = timezone;
    return session;
  }
}
