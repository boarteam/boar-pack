import { VIEW_USERS } from "../users.constants";

export type Permission = typeof VIEW_USERS;

export class Permissions {
  private static values: Set<Permission> = new Set;

  public static isValidPermission(permission: Permission): boolean {
    return this.values.has(permission);
  }

  public static addPermission(permission: Permission): void {
    this.values.add(permission);
  }

  public static toArray(): Permission[] {
    return Array.from(this.values);
  }
}
