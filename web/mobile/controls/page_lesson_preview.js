function defineLessonPreview() {
    Vue.component("page-lesson-preview", {
        template: "#page_lesson_preview",
        computed: {
            lesson() {
                return this.$store.state.lessonPreview;
            }
        },
        data() {
            return{
                myParams: {
                    grabCursor: true,
                    spaceBetween: 80
                },
                mySwiperHandler: null,
                lessonContentChanged: false
            };
        },
        created() {
            this.$store.state.pageInstances.lessonPreview = this;
        },
        mounted() {
            var swiper = this.Dom7("#my-swiper-container")[0].swiper;
            this.mySwiperHandler = function (event) {
                if (event.key === "ArrowLeft") {
                    swiper.slidePrev();
                } else if (event.key === "ArrowRight") {
                    swiper.slideNext();
                }
            };
            this.Dom7(document).keydown(this.mySwiperHandler);
        },
        methods: {
            save() {
                var self = this;
                $.ajax(ServerAddress + "updateLessonContent", {
                    method: "POST",
                    data: {
                        name: self.lesson.name,
                        content: JSON.stringify(self.lesson.json)
                    }
                }).done(function (res) {
                    if (res.errorMessage) {
                        self.$f7.alert(null, self.$t("update-fail"));
                    } else {
                        self.$f7.alert(null, self.$t("save-success"));
                        self.lessonContentChanged = false;
                        self.$store.state.pageInstances.lessonManager.myLesson.list.splice(
                                self.$store.state.lessonPreviewIndex, 1, self.lesson);
                    }
                });
            },
            back() {
                if (this.lessonContentChanged) {
                    this.$f7.alert(null, this.$t("save-message"));
                    this.lessonContentChanged = false;
                    return;
                }
                this.$router.back();
            },
            hasSoundOut(item) {
                var found = false;
                var uri = null;
                if (item.attach) {
                    item.attach.forEach(function (attach) {
                        if (found) {
                            return;
                        }
                        if (attach.type === "sound-out") {
                            found = true;
                            uri = attach.uri;
                        }
                    });
                }
                return [found, uri];
            },
            hasSoundIn(item) {
                return checkItemAttachmentType(item, "sound-in");
            },
            removeSound(item) {
                var self = this;
                if (item.items) {
                    item.items.forEach(function (item) {
                        if (item.attach) {
                            for (var i = item.attach.length - 1; i >= 0; i--) {
                                if (item.attach[i].type === "sound-out") {
                                    item.attach.splice(i, 1);
                                }
                            }
                            if (!item.attach.length) {
                                delete item.attach;
                            }
                        }
                        delete item.hasSoundOut;
                    });
                } else {
                    if (item.attach) {
                        for (var i = item.attach.length - 1; i >= 0; i--) {
                            if (item.attach[i].type === "sound-out") {
                                item.attach.splice(i, 1);
                            }
                        }
                        if (!item.attach.length) {
                            delete item.attach;
                        }
                    }
                    delete item.hasSoundOut;
                }
                self.lessonContentChanged = true;
            },
            clickItemForSound(item) {
                var self = this;
                self.$store.commit("setEditItemSound", {item: item});

                var itemSoundActions = [
                    {
                        text: self.$t("record-new-sound"),
                        onClick: function () {
                            self.$f7.views.main.router.load({url: "/soundManager/"});
                        }
                    },
                    {
                        text: self.$t("play-sound"),
                        soundUri: "hi",
                        onClick: function () {
                            self.$f7.showPreloader(self.$t("load-sound"));
                            var sound = new Howl({
                                src: [this.soundUri],
                                format: ["mp3"],
                                onloaderror: function () {
                                    self.$f7.hidePreloader();
                                    self.$f7.alert(null, self.$t("cannot-play"));
                                },
                                onload: function () {
                                    self.$f7.hidePreloader();
                                }
                            });
                            sound.play();//firefox mono 
                        }
                    },
                    {
                        text: self.$t("cancel")
                    },
                    {
                        text: self.$t("remove-sound"),
                        color: "red",
                        onClick: function () {
                            self.$f7.confirm(self.$t("remove-sound-message", {itemText: item.text}),
                                    self.$t("remove-sound-attachments"),
                                    function () {
                                        self.removeSound(item);
                                        self.$forceUpdate();
                                    }
                            );
                        }
                    },
                    {
                        text: self.$t("remove-sound-in"),
                        color: "red",
                        onClick: function () {
                            if (item.attach) {
                                for (var i = item.attach.length - 1; i >= 0; i--) {
                                    if (item.attach[i].type === "sound-in") {
                                        item.attach.splice(i, 1);
                                    }
                                }
                                if (!item.attach.length) {
                                    delete item.attach;
                                }
                            }
                            self.lessonContentChanged = true;
                            self.$forceUpdate();
                        }
                    },
                    {
                        text: self.$t("add-sound-in"),
                        onClick: function () {
                            if (!item.attach) {
                                item.attach = [{type: "sound-in"}];
                            } else {
                                item.attach.push({
                                    type: "sound-in"
                                });
                            }
                            self.lessonContentChanged = true;
                            self.$forceUpdate();
                        }
                    }
                ];

                var thisActions = [];
                var hasSound = false, hasSoundIn = false;
                if (item.attach) {
                    item.attach.forEach(function (attach) {
                        if (hasSound) {
                            return;
                        }
                        if (attach.type === "sound-out") {
                            if (attach.uri) {
                                var uri = new URI(attach.uri);
                                var nuri;
                                if (uri.protocol() === "http" || uri.protocol() === "https") {
                                    nuri = uri.toString();
                                    itemSoundActions[1].soundUri = nuri;
                                    hasSound = true;
                                    self.$store.state.editItemSound.soundValid = true;

                                } else if (uri.protocol() === "openwords") {
                                    var segs = uri.segment();
                                    nuri = "getSound?userId=" + segs[0] + "&fileName=" + segs[1];
                                    nuri = ServerAddress + nuri;
                                    itemSoundActions[1].soundUri = nuri;
                                    hasSound = true;

                                    self.$store.state.editItemSound.soundValid = true;
                                    self.$store.state.editItemSound.soundFile = segs[1];
                                }
                            }
                        }
                        if (attach.type === "sound-in") {
                            hasSoundIn = true;
                        }
                    });
                }
                if (!hasSoundIn) {
                    thisActions.push(itemSoundActions[0]);
                }
                if (hasSound) {
                    thisActions.push(itemSoundActions[1]);
                    thisActions.push(itemSoundActions[3]);
                } else {
                    if (hasSoundIn) {
                        thisActions.push(itemSoundActions[4]);
                    } else {
                        thisActions.push(itemSoundActions[5]);
                    }
                }
                thisActions.push(itemSoundActions[2]);
                self.$f7.actions(thisActions);
            }
        },
        beforeDestroy() {
            console.log("page-lesson_preview beforeDestroy");
            this.Dom7(document).off("keydown", this.mySwiperHandler);
            Howler.unload();
        },
        destroyed() {
            console.log("page-lesson_preview destroyed");
            this.$store.state.pageInstances.lessonPreview = null;
        }
    });
}

