CREATE TABLE `comment` (
  `user_id` bigint(20) NOT NULL,
  `make_time` bigint NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `comment`
 ADD PRIMARY KEY (`user_id`, `make_time`);
