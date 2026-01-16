// src/config/redirects.ts

export type RoleId = "A" | "C" | string;

interface RedirectConfig {
  [roleId: string]: string;
}

export const redirects = {
  afterLogin: {
    A: "/admin/products",
    C: "/",
    default: "*",
  } as RedirectConfig,

  afterRegister: {
    A: "/",
    C: "/",
    default: "*",
  } as RedirectConfig,

  afterLogout: {
    A: "/nhan-vien/dang-nhap",
    C: "/",
    default: "/",
  } as RedirectConfig,

  home: {
    A: "/dashboard",
    C: "/",
    default: "*",
  } as RedirectConfig,
};