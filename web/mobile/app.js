$.ajax({
    url: "all.html"
}).done(function (data) {
    var html = $.parseHTML(data);
    $("#templates").append(html);

    defineLoginPage();
    defineHomePage();
    defineStepsPage();
    defineRegisterPage();
    defineCourseProgressPage();
    defineCourseListPart();
    defineAudiencePart();
    defineLessonManagerPage();
    defineCourseManagerPage();
    defineCourseEditPage();
    defineLessonPreview();
    defineStepsPage();
    defineSoundManagerPage();
    defineCourseStudy();
    defineCompSoundIn();
    defineCompOwmlPreview();

    Vue.component("my-editable-span", {
        template: "<span contenteditable='true' v-on:click='click' v-on:input='update' style='outline: none; display:inline-block; min-width: 30px; height: 1em;'></span>",
        props: ["text"],
        mounted() {
            this.$el.innerText = this.text.text;
        },
        methods: {
            update() {
                this.text.text = this.$el.innerText.trim();//safari adds line break...
                this.$emit("type-in-done");
            },
            click() {
                this.$el.focus();
            }
        }
    });

    Vue.use(window.vuelidate.default);

    const store = new Vuex.Store({
        state: {
            learningLesson: null,
            learningCourse: null,
            userInfo: null,
            chosenCourse: null,
            lessonPreview: null,
            lessonPreviewIndex: -1,
            editItemSound: null,
            pageInstances: {
                courseProgress: null,
                lessonPreview: null,
                lessonManager: null,
                home: null
            },
            allCourseList: {
                all: true,
                page: 1,
                pageSize: 7,
                list: null,
                showCourse: []
            },
            currentLanguage: null
        },
        mutations: {
            setLearningLesson(state, lesson) {
                state.learningLesson = lesson;
            },
            setLearningCourse(state, c) {
                state.learningCourse = c;
            },
            setChosenCourse(state, c) {
                state.chosenCourse = c;
            },
            setUserInfo(state, u) {
                state.userInfo = u;
            },
            setLessonPreviewData(state, data) {
                state.lessonPreview = data.data;
                state.lessonPreviewIndex = data.index;
            },
            setEditItemSound(state, item) {
                state.editItemSound = item;
            },
            setCurrentLanguage(state, lang) {
                state.currentLanguage = lang;
            }
        }
    });

    Vue.use(vuexI18n.plugin, store);
    Vue.i18n.add("en", en);
    Vue.i18n.set("en");
    Vue.i18n.fallback("en");
    store.commit("setCurrentLanguage", supportedLanguages[0]);

    new Vue({
        el: "#root",
        store,
        framework7: {
            root: "#root",
            modalButtonOk: "OK",
            modalButtonCancel: "Cancel",
            routes: [
                {
                    path: "/login/",
                    component: "page-login"
                },
                {
                    path: "/home/",
                    component: "page-home"
                },
                {
                    path: "/steps/",
                    component: "page-steps"
                },
                {
                    path: "/register/",
                    component: "page-register"
                },
                {
                    path: "/courseProgress/",
                    component: "page-course-progress"
                },
                {
                    path: "/lessonManager/",
                    component: "page-lesson-manager"
                },
                {
                    path: "/courseManager/",
                    component: "page-course-manager"
                },
                {
                    path: "/editCourse/",
                    component: "page-course-edit"
                },
                {
                    path: "/lessonPreview/",
                    component: "page-lesson-preview"
                },
                {
                    path: "/soundManager/",
                    component: "page-sound-manager"
                },
                {
                    path: "/study/",
                    component: "page-study"
                }
            ],
            animateNavBackIcon: true,
            showBarsOnPageScrollEnd: false,
            showBarsOnPageScrollTop: false,
            hideNavbarOnPageScroll: true,
            swipeBackPage: false
        },
        methods: {
            logOut() {
                var self = this;
                self.$f7.confirm(null, this.$t("logout-OK"),
                        function () {
                            $.get(ServerAddress + "logoutUser");
                            self.$f7.views.main.router.back();
                            self.$f7.alert(self.$t("see-you-message"), self.$t("see-you"));
                        }
                );
            },
            manageLessons() {
                this.$f7.views.main.router.load({url: "/lessonManager/"});
            },
            manageCourses() {
                this.$f7.views.main.router.load({url: "/courseManager/"});
            },
            goProgress() {
                this.$f7.views.main.router.load({url: "/study/"});
            },
            goFormat() {
                window.location.href = "https://github.com/Openwords/OpenwordsWebapp/wiki/Openwords-Problem-Markup-Language-v0.2";
            },
            searchCourses() {
                var self = this;
                var doSearch = function () {
                    var term = $("#search_course_name").val();
                    if (!term) {
                        self.$f7.alert(self.$t("type-someting"), self.$t("error"));
                        return;
                    }
                    if (!term.trim()) {
                        self.$f7.alert(self.$t("type-someting"), self.$t("error"));
                        return;
                    }
                    self.$store.state.allCourseList.courseNameSearch = term;
                    self.$store.state.allCourseList.page = 1;
                    listCourse(self.$store.state.allCourseList,
                            function (error) {
                                self.$f7.alert(null, self.$t(error));
                            },
                            function (list) {
                                self.$store.state.allCourseList.showCourse = list;
                                self.$store.state.pageInstances.home.showPart(0);
                            });
                };
                var modal = self.$f7.modal({
                    title: self.$t("search-course"),
                    text: $("#dialog_search_courses").html(),
                    buttons: [
                        {
                            text: self.$t("cancel")
                        },
                        {
                            text: self.$t("go"),
                            bold: true,
                            onClick: doSearch
                        }
                    ]
                });
                var dom = self.Dom7(modal).find("#search_course_name");
                dom.attr("placeholder", self.$t("search-course-tip"));
                dom.on("keyup", function (event) {
                    if (event.key === "Enter") {
                        doSearch();
                        self.$f7.closeModal();
                    }
                });
            }
        }
    });

    window.onbeforeunload = function (e) {
        var dialogText = "You are now exiting this app, are you sure?";
        e.returnValue = dialogText;
        return dialogText;
    };
});