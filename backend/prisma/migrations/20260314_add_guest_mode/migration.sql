ALTER TABLE `users`
  ADD COLUMN `is_guest` TINYINT(1) NOT NULL DEFAULT 0 AFTER `external_id`;
