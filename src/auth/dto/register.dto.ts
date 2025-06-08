import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Please provide a valid email" })
  email: string;

  @IsNotEmpty({ message: "Name is required, please provide a name" })
  @IsString({ message: "Name must be a string" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(50, { message: "Name cannot be longer then 50 characters" })
  name: string;

  @IsNotEmpty({ message: "Password is required, please provide a password" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;
}
