// class User {
//   username: string;
//   email: string;
//   passwordHash: string;
//   isDelete: boolean;
//   constructor(inputModelUser: userCreateDTO, passwordHash: string) {
//     this.username = inputModelUser.username;
//     this.email = inputModelUser.email;
//     this.passwordHash = passwordHash;
//     this.isDelete = false;
//   }
// }
export class UserModel {
  userName: string;
  email: string;
  passwordHash: string;
  isDelete: boolean;
  static createUser(username: string, email: string, passwordHash: string) {
    const user = new UserModel();
    user.userName = username;
    user.email = email;
    user.passwordHash = passwordHash;
    user.isDelete = false;
    return user;
  }
}
