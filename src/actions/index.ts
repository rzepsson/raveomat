import { submitContact } from "./contact";
import { submitNewsletter } from "./newsletter";
import * as auth from "./auth";
import * as settings from "./settings";

export const server = {
  submitNewsletter,
  submitContact,
  login: auth.login,
  register: auth.register,
  logout: auth.logout,
  updateProfile: settings.updateProfile,
  changePassword: settings.changePassword,
  sendPasswordReset: settings.sendPasswordReset,
};
