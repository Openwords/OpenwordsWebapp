function defineCourseEditPage() {
    Vue.component("page-course-edit", {
        template: "#page_course_edit",
        data() {
            return {
                course: {json: {}},
                courseContentChanged: false,
                myLessons: {
                    page: 1,
                    pageSize: 10000,
                    list: null
                },
                wentToLessonManager: false
            };
        },
        mounted() {
            var self = this;
            $.get(ServerAddress + "getCourseLessons", {
                makeTime: self.$store.state.chosenCourse.makeTime
            }, function (res) {
                if (!res.errorMessage) {
                    var copy = JSON.parse(JSON.stringify(self.$store.state.chosenCourse));
                    copy.json.lessons = res.result;
                    self.course = copy;
                }
            });
            listLesson(this.myLessons);
        },
        methods: {
            back() {
                if (this.courseContentChanged) {
                    this.$f7.alert(null, this.$t("save-message"));
                    this.courseContentChanged = false;
                    return;
                }
                this.$router.back();
            },
            goToLessonManager() {
                this.wentToLessonManager = true;
                this.$router.load({url: "/lessonManager/"});
            },
            addLessonFromPool(lesson) {
                this.courseContentChanged = true;
                if (this.course) {
                    this.course.json.lessons.push(JSON.parse(JSON.stringify(lesson)));
                }
            },
            saveCourse() {
                var self = this;
                if (!self.course.name) {
                    self.$f7.alert(null, self.$t("save-name"));
                    return;
                }
                self.course.json.totalLesson = self.course.json.lessons.length;
                self.course.content = JSON.stringify(self.course.json);
                self.course.json = null;
                $.ajax(ServerAddress + "saveCourse", {
                    method: "POST",
                    data: {course: JSON.stringify(self.course)}
                }).done(function (res) {
                    if (res.errorMessage) {
                        self.$f7.alert(null, self.$t("save-fail"));
                    } else {
                        self.$f7.alert(null, self.$t("save-success"));
                        self.$router.back();
                    }
                });
            },
            courseLessonAction(index) {
                var self = this;
                var lessonArray = self.course.json.lessons;
                self.course.json.lessons = lessonArray;
                self.$f7.actions([
                    {
                        text: self.$t("move-up"),
                        onClick: function () {
                            if (index > 0) {
                                var les = lessonArray[index];
                                var itemGoDown = lessonArray[index - 1];
                                lessonArray.splice(index - 1, 1, les);
                                lessonArray.splice(index, 1, itemGoDown);
                                self.courseContentChanged = true;
                            }
                        }
                    },
                    {
                        text: self.$t("move-down"),
                        onClick: function () {
                            if (index < lessonArray.length - 1) {
                                var les = lessonArray[index];
                                var itemGoUp = lessonArray[index + 1];
                                lessonArray.splice(index + 1, 1, les);
                                lessonArray.splice(index, 1, itemGoUp);
                                self.courseContentChanged = true;
                            }
                        }
                    },
                    {
                        text: self.$t("immediate-feedback-mode"),
                        onClick: function () {
                            var lesson = lessonArray[index];
                            lesson.imf = true;
                            self.courseContentChanged = true;
                        }
                    },
                    {
                        text: self.$t("end-feedback-mode"),
                        onClick: function () {
                            var lesson = lessonArray[index];
                            lesson.imf = false;
                            self.courseContentChanged = true;
                        }
                    },
                    {
                        text: self.$t("remove"),
                        color: "red",
                        onClick: function () {
                            lessonArray.splice(index, 1);
                            self.courseContentChanged = true;
                        }
                    },
                    {
                        text: self.$t("cancel")
                    }
                ]);
            },
            popupOpened() {
                if (this.wentToLessonManager) {
                    this.wentToLessonManager = false;
                    listLesson(this.myLessons);
                }
            }
        }
    });
}