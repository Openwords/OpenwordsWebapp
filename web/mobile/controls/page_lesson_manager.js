function defineLessonManagerPage() {
    Vue.component("page-lesson-manager", {
        template: "#page_lesson_manager",
        data() {
            return {
                buttonShow: false,
                name: null,
                uploadFlag: false,
                uploadingFile: {
                    name: null
                },
                myLesson: {
                    page: 1,
                    pageSize: 10000,
                    list: null
                },
                comments: null,
                OWML: null
            };
        },
        created() {
            this.$store.state.pageInstances.lessonManager = this;
        },
        mounted() {
            listLesson(this.myLesson);

            var self = this;
            var dropzone = new Dropzone("#my-upload", {
                url: ServerAddress + "uploadLesson",
                maxFiles: 10,
                maxFilesize: 512,
                acceptedFiles: ".txt",
                autoProcessQueue: false,
                previewTemplate: "<div class=\"dz-preview dz-file-preview\"> \n\
                                   <div class=\"dz-details\"> \n\
                                       <div class=\"dz-filename\"><span data-dz-name></span></div>\n\
                                       <div class=\"dz-size\" data-dz-size></div>\n\
                                   </div>\n\
                                   <div class=\"dz-success-mark\"></div>\n\
                                  </div>"
            });
            dropzone.on("addedfile", function (file) {
                self.buttonShow = true;
            });
            dropzone.on("sending", function (file, xhr, formData) {
                formData.append("name", self.name);
            });
            dropzone.on("removedfile", function (file, xhr, formData) {
                self.buttonShow = false;
            });
            dropzone.on("success", function (file) {
                self.uploadFlag = true;
            });
            dropzone.on("complete", function (file) {
                if (self.uploadFlag) {
                    listLesson(self.myLesson);
                    self.$f7.alert(null, self.$t("upload-success"));
                    self.buttonShow = false;
                    self.uploadFlag = false;
                } else {
                    self.$f7.alert(null, self.$t("upload-fail"));
                    Dropzone.forElement("#my-upload").removeFile(file);
                    self.buttonShow = false;
                }
            });
        },
        methods: {
            showSupport: function () {
                this.$f7.alert("<div>sound-out (mp3)</div><div>sound-in</div><div>type-in</div>", this.$t("support-type"));
            },
            uploadFile: function () {
                var self = this;
                self.$f7.prompt(self.$t("upload-lesson-message"), self.$t("uploading-lesson"), function (v) {
                    self.name = v;
                    if (self.name) {
                        Dropzone.forElement("#my-upload").processQueue();
                    } else {
                        self.$f7.alert(null, self.$t("upload-name-error"));
                    }
                });
            },
            reset: function () {
                var self = this;
                Dropzone.forElement("#my-upload").removeAllFiles();
                self.uploadingFile = {
                    name: null
                };
            },
            lessonAction: function (le, index) {
                var self = this;
                self.myLesson.chosenLesson = le;
                self.$f7.actions([
                    {
                        text: self.$t("preview"),
                        onClick: function () {
                            self.$store.commit("setLessonPreviewData", {
                                data: JSON.parse(JSON.stringify(le)),
                                index: index
                            });
                            self.$router.load({url: "/lessonPreview/"});
                        }
                    },
                    {
                        text: self.$t("button-lesson-comments"),
                        onClick: function () {
                            self.listComments();
                        }
                    },
                    {
                        text: self.$t("owml-preview"),
                        onClick: function () {
                            self.OWML = jsonToOWML(le.json);
                            self.$f7.popup(".popup-OWML-preview");
                        }
                    },
                    {
                        text: self.$t("delete"),
                        color: "red",
                        onClick: function () {
                            self.$f7.confirm(self.$t("delete-lesson-message", {lessonName: self.myLesson.chosenLesson.name}),
                                    self.$t("delete-lesson"),
                                    function () {
                                        var params = {
                                            name: self.myLesson.chosenLesson.name
                                        };
                                        $.get(ServerAddress + "deleteLesson", params, function (res) {
                                            if (!res.errorMessage) {
                                                self.myLesson.list.splice(index, 1);
                                                self.$f7.alert(null, self.$t("lesson-delete"));
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
            },
            listComments() {
                var self = this;
                $.ajax(ServerAddress + "listComment", {
                    data: {authorId: self.myLesson.chosenLesson.userId, lessonName: self.myLesson.chosenLesson.name}
                }).done(function (res) {
                    if (res.errorMessage) {
                        self.$f7.alert(null, self.$t("no-results"));
                        return;
                    }
                    if (!res.result.length) {
                        self.$f7.alert(null, self.$t("no-results"));
                        return;
                    }
                    res.result.forEach(function (c) {
                        c.json.updated = moment(c.json.updated).format("MMM D, HH:mm");
                    });
                    self.comments = res.result;
                    self.$f7.popup(".popup-comments-list");
                });
            }
        }
    });
}