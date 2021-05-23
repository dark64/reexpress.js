import express from "express";

export type Request = express.Request;
export type Response = express.Response;
export type NextFunction = express.NextFunction;
export type Initializable<T> = { new (): T };
export type RequestHandler<T> = (req?: Request, res?: Response) => Promise<T>;

export abstract class Rule {
  readonly status: number = 400;
  readonly message: string = "Unsatisfied rule";
  abstract apply(req: Request): Promise<boolean>;
}

export type BlueprintRequestHandler = {
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  handler: RequestHandler<Response>;
};

export abstract class Blueprint {
  abstract readonly path: string;
  protected ruleset?: Initializable<Rule>[];

  get handlers(): BlueprintRequestHandler[] {
    return Reflect.getMetadata("blueprint:handlers", this) || [];
  }

  register(router: express.Router): express.Router {
    // register ruleset
    if (this.ruleset && this.ruleset.length > 0) {
      router.use(
        this.path,
        this.ruleset.map((RuleType) => {
          return async (req: Request, res: Response, next: NextFunction) => {
            let rule = new RuleType();
            if (await rule.apply(req)) {
              next();
            } else {
              res
                .status(rule.status)
                .json({ status: rule.status, error: rule.message });
            }
          };
        })
      );
    }

    // register handlers
    this.handlers.forEach(({ path, method, handler }) => {
      router[method]([this.path, path].join(""), (req, res) => {
        handler(req, res).catch((e = {}) =>
          res.status(e.status || 500).json(e)
        );
      });
    });

    return router;
  }
}
