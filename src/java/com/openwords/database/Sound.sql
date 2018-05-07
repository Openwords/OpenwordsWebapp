CREATE TABLE `sound` (
  `user_id` bigint(20) NOT NULL,
  `sound_text` text COLLATE utf8_unicode_ci NOT NULL,
  `language` varchar(10) NOT NULL,
  `file_path` varchar(100) NOT NULL,
  `updated_time` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `sound`
 ADD PRIMARY KEY (`user_id`, `updated_time`);
