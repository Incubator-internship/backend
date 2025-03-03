export abstract class ProfileDTOModel {
  firstName: string;
  lastName: string;
  dateOfBirthday: Date | null;
  country: string | null;
  city: string | null;
  aboutMe: string | null;
  profileId: number;
}
