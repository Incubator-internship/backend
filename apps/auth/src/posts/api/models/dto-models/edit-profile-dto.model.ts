export class EditProfileDTOModel {
  userName: string;
  firstName: string;
  lastName: string;
  dateOfBirthday: string | null = null;
  country: string | null = null;
  city: string | null = null;
  aboutMe: string | null = null;
  profileId: number;
}
