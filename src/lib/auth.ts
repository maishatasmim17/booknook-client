import dns from "node:dns";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const DEFAULT_DB_NAME = "booknook";

// Public resolvers used when the machine's own DNS cannot resolve the SRV
// record required by `mongodb+srv://` URIs (e.g. c-ares points at a loopback
// resolver that is not running, which fails with `querySrv ECONNREFUSED`).
const FALLBACK_DNS_SERVERS = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

const hasPlaceholderCredentials = (value: string): boolean =>
  value.includes("testuser:testpass") ||
  value.includes("<user>") ||
  value.includes("<password>");

/** Append the database name when a `mongodb+srv://` URI omits it. */
const normalizeMongoUri = (value: string): string => {
  try {
    const parsed = new URL(value);
    if (!parsed.pathname || parsed.pathname === "/") {
      parsed.pathname = `/${DEFAULT_DB_NAME}`;
    }
    return parsed.toString();
  } catch {
    return value;
  }
};

/**
 * Better Auth opens its Mongo connection lazily, so the driver's SRV lookup
 * happens on the first auth request. On some Windows setups Node's default
 * c-ares resolver points at a loopback server that is not running, so every
 * `resolveSrv`/`resolve` call fails with `ECONNREFUSED` even after
 * `dns.setServers()`. A dedicated Resolver created after `setServers` works,
 * so route the driver's SRV query through one when that happens (or when
 * DNS_SERVERS is set explicitly). Host lookups keep using the OS resolver.
 */
const ensureDnsResolution = (value: string): void => {
  if (!value.startsWith("mongodb+srv://")) return;

  const configuredServers = dns.getServers();
  const loopbackOnly = configuredServers.every(
    (server) => server === "127.0.0.1" || server === "::1"
  );

  if (!loopbackOnly && !process.env.DNS_SERVERS) return;

  const resolver = new dns.promises.Resolver();
  resolver.setServers(FALLBACK_DNS_SERVERS);
  (dns.promises as { resolve: typeof dns.promises.resolve }).resolve =
    resolver.resolve.bind(resolver);
  console.warn(
    `[Auth] Using DNS servers for MongoDB SRV lookup: ${FALLBACK_DNS_SERVERS.join(", ")}`
  );
};

const uri = normalizeMongoUri(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/booknook"
);

if (hasPlaceholderCredentials(uri)) {
  console.error(
    "[Auth] MONGODB_URI still contains placeholder credentials. " +
      "Set a real MongoDB Atlas connection string in client/.env.local - sign up and sign in will fail until then."
  );
}

ensureDnsResolution(uri);

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
const db = client.db();

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

/**
 * Better Auth rejects requests whose `Origin` is not trusted, returning
 * 403 "Invalid origin". In development the app is commonly opened through
 * `127.0.0.1` or the machine's LAN address (Next.js prints the network URL),
 * so trust those origins as well. Explicit origins can be supplied through
 * the comma-separated `TRUSTED_ORIGINS` env var in any environment.
 */
const developmentTrustedOrigins = [
  "http://localhost:*",
  "http://127.0.0.1:*",
  "http://192.168.*",
  "http://10.*",
  "http://172.*",
];

const trustedOrigins = Array.from(
  new Set([
    baseURL,
    ...(process.env.TRUSTED_ORIGINS?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []),
    ...(process.env.NODE_ENV === "production" ? [] : developmentTrustedOrigins),
  ])
);

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET || "booknook_better_auth_default_secret_key_32chars_min",
  database: mongodbAdapter(db),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false, // Prevents users from self-assigning roles
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "RS256",
        },
      },
      definePayload: ({
        user,
      }: {
        user: { id: string; email: string; name: string; role?: string };
      }) => ({
        id: user.id,
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role || "user",
      }),
    }),
  ],
});
