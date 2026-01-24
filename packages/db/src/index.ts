// Client exports
export { createBrowserClient } from "./client";
export { createServerClient } from "./server";
export { createMiddlewareClient, updateSession } from "./middleware";

// Types
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from "./types";

// Queries
export * from "./queries/clinics";
export * from "./queries/specialists";
