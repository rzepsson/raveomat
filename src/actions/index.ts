import { submitContact } from "./contact";
import { submitNewsletter } from "./newsletter";
import * as auth from "./auth";

export const server = {
  submitNewsletter,
  submitContact,
  login: auth.login,
  register: auth.register,
  logout: auth.logout,
};
