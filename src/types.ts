import express from "express";

export type Request = express.Request;
export type Response = express.Response;
export type NextFunction = express.NextFunction;
export type Initializable<T> = { new (): T };

export abstract class Rule {
  readonly status: number = 400;
  readonly message: string = "Unsatisfied rule";
  abstract apply(req: Request): Promise<boolean>;
}

const DEFAULT_ERROR = {
  status: 500,
  message: "An unexpected error occurred on the server",
};

export abstract class Blueprint<T = any> {
  abstract readonly path: string;
  protected readonly ruleset?: Initializable<Rule>[];

  protected getMany?(req: Request, res: Response): Promise<T[] | undefined>;
  protected get?(req: Request, res: Response): Promise<T | undefined>;
  protected post?(req: Request, res: Response): Promise<T | undefined>;
  protected put?(req: Request, res: Response): Promise<T | undefined>;
  protected delete?(req: Request, res: Response): Promise<T | undefined>;

  private errorHandler = (e = DEFAULT_ERROR, res: Response) => {
    res.status(e.status).json({ status: e.status, error: e.message });
  };

  register(router: express.Router): express.Router {
    if (this.ruleset && this.ruleset.length > 0) {
      router.use(
        this.path,
        this.ruleset.map((RuleType) => {
          return async (req: Request, res: Response, next: NextFunction) => {
            let rule = new RuleType();
            if (await rule.apply(req)) {
              next();
            } else {
              this.errorHandler(rule, res);
            }
          };
        })
      );
    }

    // TODO: refactor this mess below
    if (this.get) {
      router.get(`${this.path}/:id`, (req, res) => {
        this.get(req, res)
          .then((r) => (r ? res.status(200).json(r) : res.sendStatus(404)))
          .catch((e = DEFAULT_ERROR) => this.errorHandler(e, res));
      });
    }
    if (this.getMany) {
      router.get(`${this.path}/`, (req, res) => {
        this.getMany(req, res)
          .then((r = []) => res.status(200).json(r))
          .catch((e = DEFAULT_ERROR) => this.errorHandler(e, res));
      });
    }
    if (this.post) {
      router.post(`${this.path}/`, (req, res) => {
        this.post(req, res)
          .then((r) => (r ? res.status(201).json(r) : res.sendStatus(204)))
          .catch((e = DEFAULT_ERROR) => this.errorHandler(e, res));
      });
    }
    if (this.put) {
      router.put(`${this.path}/:id`, (req, res) => {
        this.put(req, res)
          .then((r) => (r ? res.status(201).json(r) : res.sendStatus(204)))
          .catch((e = DEFAULT_ERROR) => this.errorHandler(e, res));
      });
    }
    if (this.delete)
      router.delete(`${this.path}/:id`, (req, res) => {
        this.delete(req, res)
          .then((r) => (r ? res.status(200).json(r) : res.sendStatus(200)))
          .catch((e = DEFAULT_ERROR) => this.errorHandler(e, res));
      });
    return router;
  }
}
