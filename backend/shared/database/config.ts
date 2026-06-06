export const dbConfig = {
  cloudSqlInstance: process.env.CLOUD_SQL_INSTANCE
    ?? "glowing-arcadia-498617-m2:us-central1:frontier123",
  user: process.env.DB_USER ?? "12frontier1",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? "sql-data",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  ssl: process.env.DB_SSL === "true",
  maxPoolSize: Number(process.env.DB_POOL_SIZE ?? 10),
  connectionString: process.env.DATABASE_URL,
} as const;
