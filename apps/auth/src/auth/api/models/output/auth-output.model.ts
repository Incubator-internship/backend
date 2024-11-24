import { ApiProperty } from '@nestjs/swagger';

//for swagger describe 400
export class ErrorMessageSwagger {
  @ApiProperty({ example: 'string' })
  message: string;
  @ApiProperty({ example: 'string' })
  field: string;
}

export class ErrorsMessagesSwaggerType {
  @ApiProperty({ type: () => ErrorMessageSwagger, isArray: true })
  errorsMessages: ErrorMessageSwagger[];
}
//-------------------------------------------------
export class ReturnAccessJWTforSwagger {
  @ApiProperty({ example: 'string' })
  accessToken: string;
}
