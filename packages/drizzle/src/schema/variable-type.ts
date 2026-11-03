import { pgEnum } from "drizzle-orm/pg-core";

export const environmentVariableTypeEnum = pgEnum("environment_variable_type", [
  "secret",
  "config",
]);
