import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

import { createClient } from '@libsql/client';

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSql(libsql);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
