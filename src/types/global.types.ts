export interface AppConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: number;
  JWT_SECRET: string;
}

export interface DecodedToken {
  userId: string;
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}
