import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Please provide a valid email" })
  email: string;

  @IsNotEmpty({ message: "Password is required, please provide a password" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;
}
