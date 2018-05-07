CREATE TABLE `lessons` (
  `user_id` bigint(20) NOT NULL,
  `lesson_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `language_one` varchar(10) NOT NULL,
  `language_two` varchar(10) NOT NULL,
  `updated_time` bigint NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `lessons`
 ADD PRIMARY KEY (`user_id`, `lesson_name`);
