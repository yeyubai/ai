CREATE TABLE `coach_analysis_sessions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `status` VARCHAR(24) NOT NULL,
  `source_type` VARCHAR(32) NOT NULL,
  `analysis_summary_json` JSON NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  `deleted_at` DATETIME(3) NULL,

  INDEX `idx_coach_sessions_user_created_at`(`user_id`, `created_at`),
  INDEX `idx_coach_sessions_user_updated_at`(`user_id`, `updated_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `coach_chat_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT NOT NULL,
  `role` VARCHAR(16) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `idx_coach_messages_session_created_at`(`session_id`, `created_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `coach_analysis_sessions`
  ADD CONSTRAINT `coach_analysis_sessions_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `coach_chat_messages`
  ADD CONSTRAINT `coach_chat_messages_session_id_fkey`
  FOREIGN KEY (`session_id`) REFERENCES `coach_analysis_sessions`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
