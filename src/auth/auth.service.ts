import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { Repository } from "typeorm";

import { LoginDto } from "@/auth/dto/login.dto";
import { RegisterDto } from "@/auth/dto/register.dto";
import { User, UserRole } from "@/auth/entities/user.entity";
import { TypedConfigService } from "@/config/typed-config";
import { UserEventsService } from "@/events/user-events.service";

interface Payload {
  sub?: number | undefined;
  iat?: number | undefined;
  exp?: number | undefined;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: TypedConfigService,
    private readonly userEventService: UserEventsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        "Email already in use! you may want to try with another email",
      );
    }

    const hashedPassword = await this.generateHash(registerDto.password);

    if (!hashedPassword) {
      throw new InternalServerErrorException("Something went wrong!");
    }

    const newUser = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: UserRole.USER,
    });

    const { password: _password, ...result } =
      await this.userRepository.save(newUser);

    this.userEventService.emitUserRegistration(newUser);

    return {
      user: result,
      message: "Registration was completed successfully!",
    };
  }

  async createAdmin(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        "Email already in use! you may want to try with another email",
      );
    }

    const hashedPassword = await this.generateHash(registerDto.password);

    if (!hashedPassword) {
      throw new InternalServerErrorException("Something went wrong!");
    }

    const newUser = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const { password: _, ...result } = await this.userRepository.save(newUser);

    return {
      user: result,
      message: "Admin user was created successfully!",
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new NotFoundException(
        "This email is not associated with any account, try registering first.",
      );
    }

    const isCorrectPassword = await this.verifyHash({
      digest: user.password,
      password: loginDto.password,
    });

    if (!isCorrectPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = this.generateTokens(user);

    const { password: _, ...result } = user;

    return {
      user: result,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: Payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_TOKEN_SECRET"),
      });

      const user = await this.userRepository.findOne({
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        throw new UnauthorizedException("Invalid token");
      }

      const accessToken = this.generateAccessToken(user);

      return {
        accessToken,
      };
    } catch (error) {
      console.error("error on refresh route ", error);
      throw new UnauthorizedException("Invalid token");
    }
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException("User does not exists");
    }

    const { password: _, ...result } = user;
    return result;
  }

  //*  Helper functions
  private async generateHash(password: string) {
    try {
      return argon2.hash(password, {
        secret: Buffer.from(this.configService.get("PASSWORD_SECRET")),
        type: argon2.argon2id,
        parallelism: 4,
        memoryCost: 2 ** 16,
        timeCost: 3,
        hashLength: 50,
      });
    } catch (err) {
      console.error("Failed to generate password hash due to:", err);
      return null;
    }
  }

  private async verifyHash({
    digest,
    password,
  }: {
    digest: string;
    password: string;
  }) {
    try {
      return argon2.verify(digest, password, {
        secret: Buffer.from(this.configService.get("PASSWORD_SECRET")),
      });
    } catch (error) {
      console.error("Failed to verify password due to:", error);
      return null;
    }
  }

  private generateTokens(user: User) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  private generateAccessToken(user: User): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_ACCESS_TOKEN_SECRET"),
      expiresIn: "15m",
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      sub: user.id,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: "15d",
    });
  }
}
