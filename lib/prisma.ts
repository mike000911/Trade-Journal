import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

type ParsedDatabaseUrl = {
  host: string | null;
  port: string | null;
  database: string | null;
  isValid: boolean;
  usesPooling: boolean | null;
  sslMode: string | null;
};

function getCandidateDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DIRECT_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  );
}

function encodePasswordSegment(password: string) {
  return encodeURIComponent(password).replace(/%25([0-9A-Fa-f]{2})/g, "%$1");
}

function normalizeDatabaseUrl(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "";
  }

  const authMatch = trimmedUrl.match(/^(postgres(?:ql)?):\/\/([^@/]+)@(.+)$/i);

  if (!authMatch) {
    return trimmedUrl;
  }

  const [, scheme, userInfo, rest] = authMatch;
  const separatorIndex = userInfo.indexOf(":");

  if (separatorIndex < 0) {
    return trimmedUrl;
  }

  const username = userInfo.slice(0, separatorIndex);
  const rawPassword = userInfo.slice(separatorIndex + 1);
  const encodedPassword = encodePasswordSegment(rawPassword);
  let normalizedUrl = `${scheme}://${username}:${encodedPassword}@${rest}`;

  try {
    const parsedUrl = new URL(normalizedUrl);

    if (
      (parsedUrl.hostname.endsWith("supabase.co") || parsedUrl.hostname.endsWith("supabase.com")) &&
      !parsedUrl.searchParams.has("sslmode")
    ) {
      parsedUrl.searchParams.set("sslmode", "require");
      normalizedUrl = parsedUrl.toString();
    }
  } catch {
    return normalizedUrl;
  }

  return normalizedUrl;
}

function parseDatabaseUrl(url: string): ParsedDatabaseUrl {
  if (!url) {
    return {
      host: null,
      port: null,
      database: null,
      isValid: false,
      usesPooling: null,
      sslMode: null
    };
  }

  try {
    const parsedUrl = new URL(url);

    return {
      host: parsedUrl.hostname || null,
      port: parsedUrl.port || null,
      database: parsedUrl.pathname.replace(/^\//, "") || null,
      isValid: true,
      usesPooling:
        parsedUrl.searchParams.get("pgbouncer") === "true" ||
        parsedUrl.port === "6543" ||
        parsedUrl.hostname.includes("pooler"),
      sslMode: parsedUrl.searchParams.get("sslmode")
    };
  } catch {
    return {
      host: null,
      port: null,
      database: null,
      isValid: false,
      usesPooling: null,
      sslMode: null
    };
  }
}

const runtimeDatabaseUrl = normalizeDatabaseUrl(getCandidateDatabaseUrl());

function createPrismaClient() {
  return new PrismaClient({
    log: ["error", "warn"],
    datasources: runtimeDatabaseUrl
      ? {
          db: {
            url: runtimeDatabaseUrl
          }
        }
      : undefined
  });
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function getDatabaseDiagnostics() {
  const configuredUrl = parseDatabaseUrl(runtimeDatabaseUrl);
  const directUrl = parseDatabaseUrl(normalizeDatabaseUrl(process.env.DIRECT_URL || process.env.POSTGRES_URL_NON_POOLING || ""));

  return {
    databaseUrlSet: Boolean(runtimeDatabaseUrl),
    directUrlSet: Boolean(process.env.DIRECT_URL || process.env.POSTGRES_URL_NON_POOLING),
    configuredUrl,
    directUrl
  };
}

export function logDatabaseError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(`[db:${context}]`, {
    message,
    stack,
    diagnostics: getDatabaseDiagnostics()
  });
}
