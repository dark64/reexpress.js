import { Blueprint, Request, Get, Post, Put, Delete } from "../../src/index";
import { User } from "../models";
import { IsAuthenticatedRule } from "../rules";

// mock data
let users: User[] = [
  { id: 1, firstName: "John", lastName: "Smith" },
  { id: 2, firstName: "Peter", lastName: "Parker" },
];

export class Users extends Blueprint {
  path = "/users";
  ruleset = [IsAuthenticatedRule];

  @Get()
  async getMany() {
    return users;
  }

  @Get("/:id")
  async get(req: Request) {
    const user = users.filter((u) => u.id.toString() === req.params.id)[0];
    if (!user) throw { status: 404, message: "Entity not found" };
    return user;
  }

  @Post()
  async post(req: Request) {
    let user = {
      id: users.length + 1,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };
    users.push(user);
    return user;
  }

  @Put("/:id")
  async put(req: Request) {
    let id = parseInt(req.params.id);
    if (!users[id])
      throw { status: 404, message: "Entity not found" };

    users[id] = {
      id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    };
    return users[id];
  }

  @Delete("/:id")
  async delete(req: Request) {
    users = users.filter((u) => u.id.toString() !== req.params.id);
    return users;
  }
}
