import { Injectable } from "@nestjs/common";
import { ThrottlerException, ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const email: string = (req.body?.email as string) || "anonymous";
    return Promise.resolve(`login-${email}`);
  }

  protected getLimit(): Promise<number> {
    return Promise.resolve(10);
  }

  protected getTTL(): Promise<number> {
    return Promise.resolve(60_000);
  }

  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      "Too many attempts. Please try again after 1 minute",
    );
  }
}
