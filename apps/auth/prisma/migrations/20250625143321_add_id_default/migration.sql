-- AlterTable
CREATE SEQUENCE profile_profileid_seq;
ALTER TABLE "profile" ALTER COLUMN "profileId" SET DEFAULT nextval('profile_profileid_seq');
ALTER SEQUENCE profile_profileid_seq OWNED BY "profile"."profileId";
