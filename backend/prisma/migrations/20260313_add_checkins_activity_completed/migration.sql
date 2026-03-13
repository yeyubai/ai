ALTER TABLE `checkins_activity`
  ADD COLUMN `completed` TINYINT(1) NOT NULL DEFAULT 1 AFTER `checkin_date`;
