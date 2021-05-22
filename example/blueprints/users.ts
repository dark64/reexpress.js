import { Blueprint, Request } from "../../src/types";
import { User, USERS } from "../models";
import { IsAuthenticatedRule } from "../rules";

export class Users extends Blueprint<User> {
  path = "/users";
  ruleset = [IsAuthenticatedRule];

  async getMany() {
    return USERS;
  }

  async get(req: Request) {
    const user = USERS.filter((u) => u.id == req.params.id)[0];
    if (!user) throw { status: 404, message: "Entity not found" };
    return user;
  }
}
