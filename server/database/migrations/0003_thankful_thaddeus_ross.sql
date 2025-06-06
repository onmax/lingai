CREATE TABLE `lessons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`blob_key` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`lesson_number` integer NOT NULL,
	`language` text DEFAULT 'spanish' NOT NULL,
	`method` text DEFAULT 'assimil' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
