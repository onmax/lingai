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
  targetLanguage: text('target_language').notNull().default('spanish'),
  userLanguage: text('user_language').notNull().default('english'),
  difficulty: text('difficulty').notNull().default('intermediate'), // beginner, intermediate, advanced
  topics: text('topics'), // JSON array of topics as string
  lessonNumber: integer('lesson_number').notNull(),
  totalSentences: integer('total_sentences').notNull().default(0),
  comicImageUrl: text('comic_image_url'), // URL to comic image in blob storage
  comicImageGenerated: integer('comic_image_generated', { mode: 'boolean' }).notNull().default(false),
  // Recap lesson fields
  isRecapLesson: integer('is_recap_lesson', { mode: 'boolean' }).notNull().default(false),
  recapMarkdownUrl: text('recap_markdown_url'), // URL to markdown file in blob storage
  recapGenerated: integer('recap_generated', { mode: 'boolean' }).notNull().default(false),
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
