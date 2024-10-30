// export class Session {
//   constructor(
//     public deviceId: string,
//     public ip: string,
//     public deviceName: string,
//     public userId: number,
//     public issuedAt: string,
//   ) {}
// }
export class Session {
  deviceId: string;
  ip: string;
  deviceName: string;
  userId: number;
  issuedAt: string;
  constructor() {}
  static createDeviceSession(
    deviceId: string,
    ip: string,
    deviceName: string,
    userId: number,
    issuedAt: string,
  ) {
    const session = new this();
    session.deviceId = deviceId;
    session.ip = ip;
    session.deviceName = deviceName;
    session.userId = userId;
    session.issuedAt = issuedAt;
    return session;
  }
}
