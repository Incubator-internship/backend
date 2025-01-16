import { ConfigModule } from '@nestjs/config';
import * as process from 'node:process';

console.log(
  ' process.env.ENV_FILE_PATH?.trim()',
  process.env.ENV_FILE_PATH?.trim(),
);
export const configModule = ConfigModule.forRoot({
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim(), // this example for devops we can start application usage another .env
    // for example in my system Windows i have another prod env .env.prodaction and path for this file G:/Backend/.env.prodaction
    //i can write command that is below
    //$env:ENV_FILE_PATH="G:/Backend/.env.prodaction"; nest start auth --watch (this command for Windows)
    //and my application will start use env with this path
    //IMPORTANT file env which we write first has BIGGEST priority than env below
    //Which env higher themes it more important
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    'env.production',
  ],
  isGlobal: true,
});
