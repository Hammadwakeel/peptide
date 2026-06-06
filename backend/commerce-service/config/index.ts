export const config = {
  service: "commerce-service",
  description: "Business Logic",
  port: Number(process.env.COMMERCE_SERVICE_PORT ?? 3002),
  database: {
    type: "postgresql" as const,
    url: process.env.DATABASE_URL ?? process.env.COMMERCE_DATABASE_URL,
    cloudSqlInstance: process.env.CLOUD_SQL_INSTANCE
      ?? process.env.COMMERCE_CLOUD_SQL_INSTANCE,
  },
};
