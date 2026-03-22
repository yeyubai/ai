CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `external_id` VARCHAR(64) NOT NULL,
  `profile_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  UNIQUE INDEX `users_external_id_key`(`external_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_profiles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `height_cm` INT NOT NULL,
  `current_weight_kg` DECIMAL(5, 2) NOT NULL,
  `target_weight_kg` DECIMAL(5, 2) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  UNIQUE INDEX `user_profiles_user_id_key`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_settings` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `diary_name` VARCHAR(64) NOT NULL DEFAULT '浣撻噸鏃ヨ',
  `theme` VARCHAR(32) NOT NULL DEFAULT 'aqua-mist',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  UNIQUE INDEX `user_settings_user_id_key`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `weight_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `weight_kg` DECIMAL(5, 2) NOT NULL,
  `logged_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `note` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  INDEX `idx_weight_logs_user_logged_at`(`user_id`, `logged_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `auth_sessions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `access_token` VARCHAR(255) NOT NULL,
  `refresh_token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  UNIQUE INDEX `auth_sessions_access_token_key`(`access_token`),
  UNIQUE INDEX `auth_sessions_refresh_token_key`(`refresh_token`),
  INDEX `idx_auth_sessions_user_expires_at`(`user_id`, `expires_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_plans` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `plan_date` DATE NOT NULL,
  `refresh_seq` INT NOT NULL DEFAULT 0,
  `payload_json` JSON NOT NULL,
  `source` VARCHAR(32) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  INDEX `idx_ai_plans_user_date`(`user_id`, `plan_date`),
  INDEX `idx_ai_plans_user_date_refresh`(`user_id`, `plan_date`, `refresh_seq`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ai_reviews` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `review_date` DATE NOT NULL,
  `payload_json` JSON NOT NULL,
  `source` VARCHAR(32) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  INDEX `idx_ai_reviews_user_date`(`user_id`, `review_date`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `checkins_weight` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `checkin_date` DATE NOT NULL,
  `measured_at` DATETIME(3) NOT NULL,
  `weight_kg` DECIMAL(5, 2) NOT NULL,
  `source` VARCHAR(32) NOT NULL,
  `is_backfill` TINYINT(1) NOT NULL DEFAULT 0,
  `idempotency_key` VARCHAR(64) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  INDEX `idx_checkins_weight_user_date`(`user_id`, `checkin_date`),
  INDEX `idx_weight_user_measured_at`(`user_id`, `measured_at`),
  INDEX `idx_checkins_weight_user_created_at`(`user_id`, `created_at`),
  UNIQUE INDEX `uk_checkins_weight_user_idempotency`(`user_id`, `idempotency_key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `checkins_meal` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `checkin_date` DATE NOT NULL,
  `meal_type` VARCHAR(32) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `estimated_kcal` INT NULL,
  `image_url` VARCHAR(255) NULL,
  `is_backfill` TINYINT(1) NOT NULL DEFAULT 0,
  `idempotency_key` VARCHAR(64) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  INDEX `idx_checkins_meal_user_date`(`user_id`, `checkin_date`),
  INDEX `idx_checkins_meal_user_created_at`(`user_id`, `created_at`),
  UNIQUE INDEX `uk_checkins_meal_user_idempotency`(`user_id`, `idempotency_key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `checkins_activity` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `checkin_date` DATE NOT NULL,
  `completed` TINYINT(1) NOT NULL DEFAULT 1,
  `activity_type` VARCHAR(32) NOT NULL,
  `duration_min` INT NOT NULL,
  `steps` INT NULL,
  `estimated_kcal` INT NULL,
  `is_backfill` TINYINT(1) NOT NULL DEFAULT 0,
  `idempotency_key` VARCHAR(64) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  INDEX `idx_checkins_activity_user_date`(`user_id`, `checkin_date`),
  INDEX `idx_checkins_activity_user_created_at`(`user_id`, `created_at`),
  UNIQUE INDEX `uk_checkins_activity_user_idempotency`(`user_id`, `idempotency_key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `checkins_sleep` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `checkin_date` DATE NOT NULL,
  `sleep_at` DATETIME(3) NOT NULL,
  `wake_at` DATETIME(3) NOT NULL,
  `duration_min` INT NOT NULL,
  `is_backfill` TINYINT(1) NOT NULL DEFAULT 0,
  `idempotency_key` VARCHAR(64) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  INDEX `idx_checkins_sleep_user_date`(`user_id`, `checkin_date`),
  INDEX `idx_checkins_sleep_user_created_at`(`user_id`, `created_at`),
  UNIQUE INDEX `uk_checkins_sleep_user_idempotency`(`user_id`, `idempotency_key`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `weight_logs`
  ADD CONSTRAINT `weight_logs_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `auth_sessions`
  ADD CONSTRAINT `auth_sessions_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ai_plans`
  ADD CONSTRAINT `ai_plans_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ai_reviews`
  ADD CONSTRAINT `ai_reviews_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `checkins_weight`
  ADD CONSTRAINT `checkins_weight_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `checkins_meal`
  ADD CONSTRAINT `checkins_meal_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `checkins_activity`
  ADD CONSTRAINT `checkins_activity_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `checkins_sleep`
  ADD CONSTRAINT `checkins_sleep_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
