CREATE TABLE `courses` (
  `author_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `course_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `language_one` varchar(10) NOT NULL,
  `language_two` varchar(10) NOT NULL,
  `make_time` bigint NOT NULL,
  `updated_time` bigint(20) NOT NULL,
  `file_cover` varchar(100) NOT NULL,
  `content` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `courses`
 ADD PRIMARY KEY (`author_id`,`user_id`,`make_time`);
