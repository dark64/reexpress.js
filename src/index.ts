import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import winston from "winston";
import { json, urlencoded } from "body-parser";
import { Blueprint, Initializable } from "./types";

export interface ReexpressOptions {
  port: number;
  logger?: {
    log: (level: string, message: string) => void;
  };
  staticDir?: string;
}

export type ExpressRequestHandler = express.RequestHandler &
  express.ErrorRequestHandler;

export class Reexpress {
  private _options: ReexpressOptions;
  private _app: express.Express;
  private _logger: any;

  constructor(options: ReexpressOptions) {
    this._options = options;
    this._app = express();

    // Register common middleware
    this._app.use(helmet());
    this._app.use(json());
    this._app.use(urlencoded({ extended: true }));

    if (options.staticDir) {
      this._app.use(express.static(options.staticDir));
    }

    // Initialize default logger
    this._logger =
      options.logger ||
      winston.createLogger({
        format: winston.format.combine(
          winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
          }),
          winston.format.printf(
            (info) =>
              `${info.timestamp} ${info.level}: ${info.message}` +
              (info.splat !== undefined ? `${info.splat}` : " ")
          )
        ),
        transports: [new winston.transports.Console()],
      });
  }

  /**
   * Register express request handlers
   */
  use(...handlers: ExpressRequestHandler[]) {
    this._app.use(handlers);
  }

  /**
   * Register blueprints
   */
  blueprints(...blueprints: Initializable<Blueprint>[]) {
    blueprints.forEach((blueprintType) => {
      this._app.use(new blueprintType().register(express.Router()));
    });
  }

  /**
   * Start listening
   */
  listen() {
    this._app.get("*", (_, res) => res.sendStatus(404));
    this._app
      .listen(this._options.port, () => {
        this._logger.log(
          "info",
          `Reexpress listening on port ${this._options.port}`
        );
      })
      .on("error", (err: NodeJS.ErrnoException) => {
        this._logger.log("error", err);
      });
  }
}

export * from "./types";
export * from "./decorators";
