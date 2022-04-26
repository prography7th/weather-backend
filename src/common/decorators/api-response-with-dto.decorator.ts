import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiProperty, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ default: 200 })
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T | T[];
}

export const ApiResponseWithDto = <T extends Type<any>>(data: T, status = 200) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, data),
    ApiResponse({
      status,
      description: '성공',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              success: {},
              statusCode: { default: status },
              message: {},
              data: { allOf: [{ $ref: getSchemaPath(data) }] },
            },
          },
        ],
      },
    }),
  );
};
