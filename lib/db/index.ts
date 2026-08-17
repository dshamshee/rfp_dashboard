import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { userRelations } from './schema';

export const db = drizzle(process.env.DATABASE_URL!, { relations: userRelations });