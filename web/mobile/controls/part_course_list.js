function defineCourseListPart() {
    Vue.component("part-course-list", {
        template: "#part_course_list",
        computed: {
            allCourseList() {
                return this.$store.state.allCourseList;
            }
        },
        methods: {
            showMore() {
                var self = this;
                self.allCourseList.page += 1;
                listCourse(self.allCourseList, null, function (list) {
                    self.allCourseList.showCourse.push(...list);
                });
            },
            learnCourse(c) {
                this.$store.commit("setLearningCourse", c);
                this.$router.load({url: "/courseProgress/"});
            },
            clearSearch() {
                var self = this;
                delete self.allCourseList.courseNameSearch;
                self.allCourseList.page = 1;
                listCourse(self.allCourseList, null, function (list) {
                    self.allCourseList.showCourse = list;
                });
            }
        },
        mounted() {
            var self = this;
            console.log("part-course-list mounted");
            listCourse(self.allCourseList, null, function (list) {
                self.allCourseList.showCourse = list;
                $.get(ServerAddress + "getMyProgress", {
                    recent: true
                }, function (res) {
                    if (res.result.length !== 0) {
                        res.result[0].dateString = moment(res.result[0].makeTime).format("LL");
                        res.result[0].displayName = res.result[0].name.toUpperCase();
                        list.unshift(res.result[0]);
                        //test
                        var i = Math.floor(Math.random() * 9) + 1;
                        list[0].fileCover = "img/test" + i + ".jpg";
                        list[0].json.recent = true;
                    }
                });
            });
        },
        updated() {
            console.log("part-course-list updated");
            var self = this;
            if (self.lazy) {
                self.lazy.destroy();
                $(".page-content").off();
            }
            self.lazy = $('.my-lazy').Lazy({
                effect: "fadeIn",
                effectTime: 1000,
                threshold: 200,
                chainable: false
            });
            $(".page-content").scroll(function () {
                self.lazy.update(200);
            });
        }
    });
}