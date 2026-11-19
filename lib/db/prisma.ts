import { jsonDb } from "./json-db";

// Export the pure JSON database under the prisma alias for seamless 100% database-free operation
export const prisma = jsonDb;
