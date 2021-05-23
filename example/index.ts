import { Reexpress } from "../src/index";
import { Users } from "./blueprints/users";

const reexpress = new Reexpress({ port: 3000 });
reexpress.group("/api", Users);
reexpress.listen();
