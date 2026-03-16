ALTER TABLE `user_settings`
  ADD COLUMN `weight_unit` VARCHAR(8) NOT NULL DEFAULT 'kg' AFTER `theme`,
  ADD COLUMN `timezone` VARCHAR(64) NOT NULL DEFAULT 'Asia/Shanghai' AFTER `weight_unit`,
  ADD COLUMN `locale` VARCHAR(16) NOT NULL DEFAULT 'zh-CN' AFTER `timezone`;
