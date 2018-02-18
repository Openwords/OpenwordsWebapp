function defineCourseProgressPage() {
    Vue.component("page-course-progress", {
        template: "#page_course_progress",
        computed: {
            courseData() {
                return this.$store.state.learningCourse;
            }
        },
        data() {
            return {
                canSync: false
            };
        },
        created() {
            this.$store.state.pageInstances.courseProgress = this;
            var self = this;
            self.$f7.showPreloader(self.$t("check-progress"));
            $.get(ServerAddress + "copyCourse", {
                makeTime: self.courseData.makeTime,
                authorId: self.courseData.authorId
            }, function (res) {
                self.$f7.hidePreloader();
                if (res.errorMessage) {
                    self.$f7.alert(null, self.$t("load-course"));
                    return;
                }
                res.result.fileCover = self.$store.state.learningCourse.fileCover;//for temporary image
                self.$store.commit("setLearningCourse", res.result);
                self.canSync = res.canSync;
            });
        },
        methods: {
            learnLesson(les) {
                this.$store.commit("setLearningLesson", les);
                this.$router.load({url: "/steps/"});
            },
            syncCourse() {
                var self = this;
                var course = self.$store.state.learningCourse;
                self.$f7.confirm(self.$t("sync-message"), self.$t("syncing"), function () {
                    self.$f7.showPreloader(self.$t("syncing"));
                    $.get(ServerAddress + "syncCourse", {
                        makeTime: course.makeTime,
                        authorId: course.authorId
                    }).then(function (res) {
                        self.$f7.hidePreloader();
                        if (res.errorMessage) {
                            self.$f7.alert(null, self.$t("sync-fail"));
                            return;
                        }
                        course.json = res.result.json;
                        course.updated = res.result.updated;
                        self.canSync = false;
                    });
                });
            },
            forfeitCourse() {
                var self = this;
                var course = this.$store.state.learningCourse;
                self.$f7.confirm(self.$t("forfeit-message"),
                        self.$t("forfeit-course"),
                        function () {
                            $.get(ServerAddress + "deleteCourse", {
                                makeTime: course.makeTime,
                                authorId: course.authorId
                            }, function (res) {
                                if (!res.errorMessage) {
                                    self.$f7.alert(null, self.$t("forfeit-success"));
                                    self.$router.back();
                                }
                            });
                        }
                );
            }
        },
        destroyed() {
            this.$store.state.pageInstances.courseProgress = null;
        }
    });
}
