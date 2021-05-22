export interface User {
  id: string;
  firstName: string;
  lastName: string;
}

// mock data
export const USERS: User[] = [
  { id: "1", firstName: "John", lastName: "Smith" },
  { id: "2", firstName: "Peter", lastName: "Parker" },
];