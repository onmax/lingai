ALTER TABLE `lessons` ADD `comic_image_url` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `comic_image_generated` integer DEFAULT false NOT NULL;