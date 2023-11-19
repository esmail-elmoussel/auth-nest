import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ default: 'esmail@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: 'SuperSecureP@ssw0rd' })
  @IsString()
  password: string;
}
