CREATE TABLE `journals` (
	`user_id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`state_json` text NOT NULL,
	`updated_at` text NOT NULL
);
