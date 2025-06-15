ALTER TABLE `lessons` ADD `is_recap_lesson` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `lessons` ADD `recap_markdown_url` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `recap_generated` integer DEFAULT false NOT NULL;