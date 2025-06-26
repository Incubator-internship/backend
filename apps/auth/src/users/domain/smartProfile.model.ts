import { ProfileDTOModel } from '../api/models/dto-models/createProfile.types';
// class ProfileModel {
//   profileId: number;
//   firstName: string;
//   lastName: string;
//   dateOfBirthday: string | null;
//   country: string | null;
//   city: string | null;
//   aboutMe: string | null;
//   constructor(dataForProfile: ProfileDTOModel) {
//     this.profileId = dataForProfile.profileId;
//     this.firstName = dataForProfile.firstName;
//     this.lastName = dataForProfile.lastName;
//     this.dateOfBirthday = dataForProfile.dateOfBirthday;
//     this.country = dataForProfile.country;
//     this.city = dataForProfile.city;
//     this.aboutMe = dataForProfile.aboutMe;
//   }
// }

export class ProfileModel {
  profileId: number;
  firstName: string | null;
  lastName: string | null;
  dateOfBirthday: Date | null;
  country: string | null;
  city: string | null;
  aboutMe: string | null;

  static createProfile(dataForProfile: ProfileDTOModel) {
    const profile = new ProfileModel();
    profile.profileId = dataForProfile.profileId;
    profile.firstName = dataForProfile.firstName;
    profile.lastName = dataForProfile.lastName;
    profile.dateOfBirthday = dataForProfile.dateOfBirthday;
    profile.country = dataForProfile.country;
    profile.city = dataForProfile.city;
    profile.aboutMe = dataForProfile.aboutMe;
    return profile;
  }

  static updateProfile(
    profile: ProfileModel,
    dataForUpdate: Partial<ProfileDTOModel>,
  ) {
    profile.firstName = dataForUpdate.firstName ?? profile.firstName;
    profile.lastName = dataForUpdate.lastName ?? profile.lastName;
    profile.dateOfBirthday =
      dataForUpdate.dateOfBirthday ?? profile.dateOfBirthday;
    profile.country = dataForUpdate.country ?? profile.country;
    profile.city = dataForUpdate.city ?? profile.city;
    profile.aboutMe = dataForUpdate.aboutMe ?? profile.aboutMe;

    return profile;
  }
}
