export const config = {
  service: "communication-service",
  description: "Chat / Notifications",
  port: Number(process.env.COMMUNICATION_SERVICE_PORT ?? 3003),
  database: {
    type: "postgresql" as const,
    url: process.env.DATABASE_URL ?? process.env.COMMUNICATION_DATABASE_URL,
    cloudSqlInstance: process.env.CLOUD_SQL_INSTANCE
      ?? process.env.COMMUNICATION_CLOUD_SQL_INSTANCE,
  },
};
