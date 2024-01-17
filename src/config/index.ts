import 'dotenv/config';

export const PORT = process.env.PORT || 3000;
export const DISCORD_APP_ID = process.env.DISCORD_APP_ID as string;
export const DISCORD_PK = process.env.DISCORD_PK as string;
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
