import { redirects } from "../config/redirects";

export const getRedirectPath = (
  type: "afterLogin" | "afterRegister" | "afterLogout" | "home",
  roleId?: string
): string => {
  const config = redirects[type];

  if (!config) return "*";

  // Nếu config là object (chứa roleId)
  if (typeof config === "object") {
    return (roleId && config[roleId]) || config.default || "*";
  }

  // Nếu config là string (như trước)
  return config;
};
