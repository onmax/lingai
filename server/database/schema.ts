import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// User preferences and profile
export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(), // UUID from better-auth
  targetLanguage: text('target_language').notNull().default('spanish'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Topics of interest for the user
export const userTopics = sqliteTable('user_topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // UUID from better-auth
  topic: text('topic').notNull(), // e.g., 'travel', 'business', 'food', etc.
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Lessons - the container for multiple sentences
export const lessons = sqliteTable('lessons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // UUID from better-auth
  title: text('title').notNull(),
  description: text('description'),
  targetLanguage: text('target_language').notNull().default('spanish'),
  userLanguage: text('user_language').notNull().default('english'),
  difficulty: text('difficulty').notNull().default('intermediate'), // beginner, intermediate, advanced
  topics: text('topics'), // JSON array of topics as string
  lessonNumber: integer('lesson_number').notNull(),
  totalSentences: integer('total_sentences').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// Sentences - individual learning units with target text, translation, and audio
export const sentences = sqliteTable('sentences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(), // UUID from better-auth
  targetText: text('target_text').notNull(), // Text in the language being learned
  userText: text('user_text').notNull(), // Translation in user's native language
  audioUrl: text('audio_url'), // URL to audio file in blob storage
  audioGenerated: integer('audio_generated', { mode: 'boolean' }).notNull().default(false),
  sentenceOrder: integer('sentence_order').notNull().default(0), // Order within the lesson
  context: text('context'), // Additional context or notes about the sentence
  difficulty: text('difficulty').default('intermediate'), // sentence-level difficulty
  tags: text('tags'), // JSON array of tags/categories
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// User progress tracking for sentences
export const userSentenceProgress = sqliteTable('user_sentence_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // UUID from better-auth
  sentenceId: integer('sentence_id').notNull().references(() => sentences.id, { onDelete: 'cascade' }),
  lessonId: integer('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  practiceCount: integer('practice_count').notNull().default(0),
  lastPracticedAt: integer('last_practiced_at', { mode: 'timestamp' }),
  masteryLevel: integer('mastery_level').notNull().default(0), // 0-5 scale
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})
