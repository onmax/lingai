import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// User preferences and profile
export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(), // Links to better-auth user table
  targetLanguage: text('target_language').notNull().default('spanish'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Languages that user speaks (with proficiency levels)
export const userLanguages = sqliteTable('user_languages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // Links to better-auth user table
  language: text('language').notNull(), // e.g., 'english', 'french', etc.
  level: text('level').notNull(), // 'beginner', 'intermediate', 'advanced', 'native'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Topics of interest for the user
export const userTopics = sqliteTable('user_topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // Links to better-auth user table
  topic: text('topic').notNull(), // e.g., 'travel', 'business', 'food', etc.
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Note: Available topics removed - users can add any custom topics

// Predefined list of available languages
export const availableLanguages = sqliteTable('available_languages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // e.g., 'en', 'es', 'fr'
  name: text('name').notNull(), // e.g., 'English', 'Spanish', 'French'
  nativeName: text('native_name').notNull(), // e.g., 'English', 'Español', 'Français'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})
