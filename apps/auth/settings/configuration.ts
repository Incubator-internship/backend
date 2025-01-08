import { config } from 'dotenv';
import * as process from 'process';

config();
export const AUTH_METHODS = {
  base: 'Basic',
  bearer: 'Bearer',
};

export type EnvironmentVariable = { [key: string]: string | undefined };
export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';

export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}

class Configuration {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
  ) {}
}

class APISettings {
  //Error req
  public readonly UserError = 'User not found';
  //Token
  public readonly JWT_SECRET: string;
  REFRESH_TOKEN_EXPIRATION_TIME = '18s';
  ACCESS_TOKEN_EXPIRATION_TIME = '8s';
  EMAIL_CONFIRMATION_EXPIRATION_TIME = '30h';
  RECOVERY_TOKEN_EXPIRATION_TIME = '30d';
  // Application
  public readonly APP_PORT: number;
  public readonly AUTH_PORT: number;
  public readonly PORT;
  //Email
  public readonly GMAIL_COM_PASS: string;
  // Database
  public readonly POSTGRES_HOST;
  public readonly POSTGRES_PORT;
  public readonly POSTGRES_USER;
  public readonly POSTGRES_PASSWORD;
  public readonly POSTGRES_DATABASE;
  public readonly POSTGRES_DATABASE_TEST;
  public readonly TTL_THROTTLER: number;
  public readonly LIMIT_THROTTLER;
  public readonly GOOGLE_CLIENT_ID: string;
  public readonly GOOGLE_CLIENT_SECRET: string;
  public readonly GOOGLE_CALLBACK_LOCAL_URL: string;
  public readonly GOOGLE_CALLBACK_PROD_URL: string;

  constructor(private readonly envVariables: EnvironmentVariable) {
    // Application
    this.APP_PORT = this.getNumberOrDefault(
      envVariables.APP_PORT as string,
      envVariables.PORT as unknown as number,
    );
    this.AUTH_PORT = this.getNumberOrDefault(
      envVariables.APP_PORT as string,
      envVariables.PORT as unknown as number,
    );
    this.PORT = this.getNumberOrDefault(envVariables.PORT as string, 5000);
    //this.PORT = envVariables.PORT ?? '5123';
    //JWT
    this.JWT_SECRET = envVariables.JWT_SECRET ?? '123';
    //Email
    this.GMAIL_COM_PASS = envVariables.GMAIL_COM_PASS!;
    // Database
    this.POSTGRES_HOST = envVariables.POSTGRES_HOST!;
    this.POSTGRES_PORT = envVariables.POSTGRES_PORT!;
    this.POSTGRES_USER = envVariables.POSTGRES_USER!;
    this.POSTGRES_PASSWORD = envVariables.POSTGRES_PASSWORD!;
    this.POSTGRES_DATABASE = envVariables.POSTGRES_DATABASE!;
    this.POSTGRES_DATABASE_TEST = envVariables.POSTGRES_DATABASE_TEST!;
    this.TTL_THROTTLER = this.getNumberOrDefault(
      envVariables.TTL_THROTTLER as string,
      5,
    );

    this.LIMIT_THROTTLER = this.getNumberOrDefault(
      envVariables.LIMIT_THROTTLER as string,
      5,
    );

    this.GOOGLE_CLIENT_ID = envVariables.GOOGLE_CLIENT_ID;
    this.GOOGLE_CLIENT_SECRET = envVariables.GOOGLE_CLIENT_SECRET;
    this.GOOGLE_CALLBACK_LOCAL_URL = envVariables.GOOGLE_CALLBACK_LOCAL_URL;
    this.GOOGLE_CALLBACK_PROD_URL = envVariables.GOOGLE_CALLBACK_PROD_URL;
  }

  private getNumberOrDefault(value: string, defaultValue: number): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      return defaultValue;
    }

    return parsedValue;
  }
}

const env = new EnvironmentSettings(
  (Environments.includes((process.env.ENV as string)?.trim())
    ? (process.env.ENV as string).trim()
    : 'DEVELOPMENT') as EnvironmentsTypes,
);

const api = new APISettings(process.env);
export const appSettings = new Configuration(env, api);
console.log(appSettings.env.isTesting());
