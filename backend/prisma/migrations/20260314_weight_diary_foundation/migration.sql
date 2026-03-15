ALTER TABLE `user_profiles`
  ADD COLUMN `nickname` VARCHAR(64) NULL,
  ADD COLUMN `sex` VARCHAR(16) NULL,
  ADD COLUMN `birth_date` DATE NULL,
  ADD COLUMN `avatar_url` VARCHAR(255) NULL;

CREATE TABLE `weight_goals` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `start_weight_kg` DECIMAL(5, 2) NOT NULL,
  `target_weight_kg` DECIMAL(5, 2) NOT NULL,
  `target_date` DATE NULL,
  `weight_unit` VARCHAR(8) NOT NULL DEFAULT 'kg',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `weight_goals_user_id_key`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_settings` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `diary_name` VARCHAR(64) NOT NULL DEFAULT '体重日记',
  `theme` VARCHAR(32) NOT NULL DEFAULT 'aqua-mist',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL,
  UNIQUE INDEX `user_settings_user_id_key`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `weight_entries` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `entry_date` DATE NOT NULL,
  `measured_at` DATETIME(3) NOT NULL,
  `weight_kg` DECIMAL(5, 2) NOT NULL,
  `body_fat_pct` DECIMAL(5, 2) NULL,
  `note` VARCHAR(255) NULL,
  `source` VARCHAR(32) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3) NULL,
  INDEX `idx_weight_entries_user_entry_date`(`user_id`, `entry_date`),
  INDEX `idx_weight_entries_user_measured_at`(`user_id`, `measured_at`),
  INDEX `idx_weight_entries_user_created_at`(`user_id`, `created_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `weight_goals`
  ADD CONSTRAINT `weight_goals_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `weight_entries`
  ADD CONSTRAINT `weight_entries_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
