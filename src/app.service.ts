import { TypedConfigService } from "@/config/typed-config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  constructor(private configService: TypedConfigService) {}

  getHello(): string {
    console.log(this.configService.get("APP_NAME"));
    return "Hello World!";
  }
}
