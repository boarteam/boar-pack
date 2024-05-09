import { VIEW_USERS } from "../users.constants";

export interface IPermissions {
  VIEW_USERS: typeof VIEW_USERS;
}

export type Permission = string; // todo: fix and use IPermissions[keyof IPermissions];

export class Permissions {
  private static values: Set<Permission> = new Set;

  public static isValidPermission(permission: string): boolean {
    return this.values.has(permission as Permission);
  }

  public static addPermission(permission: Permission): void {
    this.values.add(permission);
  }

  public static toArray(): Permission[] {
    return Array.from(this.values);
  }
}
