import { Rule, Request } from "../src/types";

export class IsAuthenticatedRule extends Rule {
  status = 401;
  message = "Unauthorized";

  apply(req: Request): Promise<boolean> {
    return Promise.resolve(true);
  }
}