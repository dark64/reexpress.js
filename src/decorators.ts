import { Blueprint, Request, Response, RequestHandler } from "./types";

function Handler<T extends Blueprint>(
  path: string,
  method: "get" | "post" | "put" | "patch" | "delete",
  status: number
) {
  return function (
    target: T,
    propertyKey: any,
    descriptor: TypedPropertyDescriptor<RequestHandler<any>>
  ) {
    const handlers = Reflect.getMetadata("blueprint:handlers", target) || [];
    handlers.push({
      path,
      method,
      handler: async (req: Request, res: Response) => {
        let result = await descriptor.value(req, res);
        return result
          ? res.status(status).json(result)
          : res.sendStatus(status);
      },
    });
    Reflect.defineMetadata("blueprint:handlers", handlers, target);
  };
}

export function Get<T extends Blueprint>(
  path: string = "",
  status: number = 200
) {
  return Handler<T>(path, "get", status);
}

export function Post<T extends Blueprint>(
  path: string = "",
  status: number = 201
) {
  return Handler<T>(path, "post", status);
}

export function Put<T extends Blueprint>(
  path: string = "",
  status: number = 200
) {
  return Handler<T>(path, "put", status);
}

export function Patch<T extends Blueprint>(
  path: string = "",
  status: number = 200
) {
  return Handler<T>(path, "patch", status);
}

export function Delete<T extends Blueprint>(
  path: string = "",
  status: number = 200
) {
  return Handler<T>(path, "delete", status);
}
