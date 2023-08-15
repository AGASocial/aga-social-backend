import { SetMetadata } from "@nestjs/common";

export const ExceptedRoles = (...roles: string[]) => SetMetadata('excepted_roles', roles);