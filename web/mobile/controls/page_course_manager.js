function defineCourseManagerPage() {
    Vue.component("page-course-manager", {
        template: "#page_course_manager",
        data() {
            return {
                myCourseList: {
                    page: 1,
                    pageSize: 10000,
                    my: true,
                    list: null
                }
            };
        },
        mounted() {
            listCourse(this.myCourseList);
        },
        methods: {
            createCourse() {
                var self = this;
                self.$f7.prompt(self.$t("course-message-1"), self.$t("creating-course"), function (v) {
                    var name = v;
                    self.$f7.prompt(self.$t("course-message-2"), self.$t("creating-course"), function (v) {
                        var comment = v;
                        $.get(ServerAddress + "createCourse", {
                            name: name,
                            comment: comment,
                            username: self.$store.state.userInfo.username
                        }, function (res) {
                            if (!res.errorMessage) {
                                self.$f7.alert(null, self.$t("success"));
                                listCourse(self.myCourseList);
                            } else {
                                self.$f7.alert(null, self.$t("fail"));
                            }
                        });
                    });
                });
            },
            courseAction(c, index) {
                var self = this;
                self.$store.commit("setChosenCourse", c);
                self.$f7.actions([
                    {
                        text: self.$t("edit"),
                        onClick: function () {
                            self.$router.load({url: "/editCourse/"});
                        }
                    },
                    {
                        text: self.$t("delete"),
                        color: "red",
                        onClick: function () {
                            self.$f7.confirm(self.$t("delete-course-message", {courseName: c.name}),
                                    self.$t("delete-course"),
                                    function () {
                                        $.get(ServerAddress + "deleteCourse", {
                                            makeTime: c.makeTime
                                        }, function (res) {
                                            if (!res.errorMessage) {
                                                self.$f7.alert(null, self.$t("course-delete"));
                                                self.myCourseList.list.splice(index, 1);
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