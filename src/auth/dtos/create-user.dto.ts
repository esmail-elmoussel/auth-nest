import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ default: 'Esmail Elmoussel' })
  @IsString()
  name: string;

  @ApiProperty({ default: 'esmail@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: 'SuperSecureP@ssw0rd' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least 1 letter' })
  @Matches(/\d/, { message: 'Password must contain at least 1 number' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least 1 special character',
  })
  password: string;
}
