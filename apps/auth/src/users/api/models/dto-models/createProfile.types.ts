export abstract class ProfileDTOModel {
  firstName: string | null;
  lastName: string | null;
  dateOfBirthday: Date | null;
  country: string | null;
  city: string | null;
  aboutMe: string | null;
  profileId: number;
}
