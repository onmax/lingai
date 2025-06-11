CREATE TABLE `lessons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`target_language` text DEFAULT 'spanish' NOT NULL,
	`user_language` text DEFAULT 'english' NOT NULL,
	`difficulty` text DEFAULT 'intermediate' NOT NULL,
	`topics` text,
	`lesson_number` integer NOT NULL,
	`total_sentences` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sentences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lesson_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`target_text` text NOT NULL,
	`user_text` text NOT NULL,
	`audio_url` text,
	`audio_generated` integer DEFAULT false NOT NULL,
	`sentence_order` integer DEFAULT 0 NOT NULL,
	`context` text,
	`difficulty` text DEFAULT 'intermediate',
	`tags` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_sentence_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`sentence_id` integer NOT NULL,
	`lesson_id` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`practice_count` integer DEFAULT 0 NOT NULL,
	`last_practiced_at` integer,
	`mastery_level` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`sentence_id`) REFERENCES `sentences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
