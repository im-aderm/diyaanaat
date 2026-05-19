export default () => {
  const databaseUrl =
    process.env.DATABASE_URL ||
    'postgresql://deyaanat:deyaanat_password@localhost:5434/deyaanat?schema=public';

  return {
    port: parseInt(process.env.PORT ?? '3001', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    database: {
      url: databaseUrl,
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? 'default-jwt-secret-change-in-production',
      expiration: process.env.JWT_EXPIRATION ?? '15m',
      refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'default-refresh-secret-change',
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
    },
    upload: {
      dir: process.env.UPLOAD_DIR ?? '/app/uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '5242880', 10),
    },
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(','),
  };
};
