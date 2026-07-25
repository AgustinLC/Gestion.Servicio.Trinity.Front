interface HasName {
  firstName?: string;
  lastName?: string;
}

export function getFullName(user: HasName): string {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
}

export function withFullName<T extends HasName>(data: T[]): (T & { fullName: string })[] {
  return data.map((item) => ({ ...item, fullName: getFullName(item) }));
}
