export const config = {
  service: "identity-service",
  description: "Auth / RBAC",
  port: Number(process.env.IDENTITY_SERVICE_PORT ?? 3001),
  database: {
    type: "postgresql" as const,
    url: process.env.DATABASE_URL ?? process.env.IDENTITY_DATABASE_URL,
    cloudSqlInstance: process.env.CLOUD_SQL_INSTANCE
      ?? process.env.IDENTITY_CLOUD_SQL_INSTANCE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME ?? "sql-data",
    poolSize: Number(process.env.DB_POOL_SIZE ?? 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },
  smtp: {
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    email: process.env.SMTP_EMAIL ?? process.env.smtp_email ?? "",
    password: process.env.SMTP_PASSWORD ?? process.env.smtp_password ?? "",
    from: process.env.SMTP_FROM ?? process.env.SMTP_EMAIL ?? "",
  },
};
