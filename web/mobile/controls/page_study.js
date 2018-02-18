function defineCourseStudy() {
    Vue.component("page-study", {
        template: "#page_study",
        data() {
            return {
                myStudyList: {
                    page: 1,
                    pageSize: 10000,
                    user: true,
                    list: null
                }
            };
        },
        mounted() {
            listCourse(this.myStudyList, null, function (list) {
                list.forEach(function (c) {
                    if (c.json.totalLesson && c.json.totalLessonRight) {
                        c.json.progress = ((c.json.totalLessonRight / c.json.totalLesson) * 100).toFixed(0);
                    }
                });
            });
        },
        methods: {
            courseAction(c, index) {
                var self = this;
                self.$f7.actions([
                    {
                        text: self.$t("continue-study"),
                        onClick: function () {
                            self.$store.commit("setLearningCourse", c);
                            self.$router.load({url: "/courseProgress/"});
                        }
                    },
                    {
                        text: self.$t("forfeit"),
                        color: "red",
                        onClick: function () {
                            self.$f7.confirm(self.$t("forfeit-message"), self.$t("forfeit-course"),
                                    function () {
                                        $.get(ServerAddress + "deleteCourse", {
                                            makeTime: c.makeTime,
                                            authorId: c.authorId
                                        }, function (res) {
                                            if (!res.errorMessage) {
                                                self.$f7.alert(null, self.$t("forfeit-success"));
                                                self.myStudyList.list.splice(index, 1);
                                            }
                                        });
                                    }
                            );
                        }
                    },
                    {
                        text: self.$t("cancel")
                    }
                ]);
            }
        }
    });
}