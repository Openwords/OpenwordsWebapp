CREATE TABLE `stats` (
  `user_id` bigint(20) NOT NULL,
  `object_id` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `object_type` varchar(5) COLLATE utf8_unicode_ci NOT NULL,
  `updated_time` bigint(20) NOT NULL,
  `info` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

ALTER TABLE `stats`
 ADD PRIMARY KEY (`user_id`,`object_id`,`object_type`);
