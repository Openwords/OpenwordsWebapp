function defineStepsPage() {
    Vue.component("page-steps", {
        template: "#page_steps",
        computed: {
            lesson() {
                return this.$store.state.learningLesson;
            }
        },
        data() {
            return{
                myParams: {
                    grabCursor: true,
                    spaceBetween: 80
                },
                mySwiperHandler: null,
                reachFinal: false,
                answerPool: [],
                lessonComment: {
                    text: "",
                    done: false
                },
                canGoResult: false,
                onPlay: false,
                onPause: false,
                onReady: false,
                rate: 1,
                secondsDisplay: "0s",
                soundInList: [],
                owmlText: null
            };
        },
        created() {
            var self = this;
            this.lesson.json.steps.forEach(function (step, index) {
                step.id = index + 1;//temporary id for Vue
                var noAnswer = true;
                var answeredText = [];
                if (!self.answerPool[index]) {
                    self.answerPool[index] = [];
                }

                step.lines.forEach(function (line) {
                    line.forEach(function (item) {
                        gatherSoundOut(item);
                        if (item.type === "ans") {
                            noAnswer = false;
                            if (checkItemAttachmentType(item, "type-in")) {
                                item.hasTypeIn = true;
                                if (!item.userInput) {
                                    item.userInput = {text: ""};
                                }
                                if (item.items) {
                                    item.items.forEach(function (item) {
                                        var copy = JSON.parse(JSON.stringify(item));
                                        copy.typein = true;
                                        self.answerPool[index].push(copy);
                                    });
                                } else {
                                    var copy = JSON.parse(JSON.stringify(item));
                                    copy.typein = true;
                                    self.answerPool[index].push(copy);
                                }
                                return;
                            }

                            var answered = null;
                            if (item.userInput) {
                                answered = item.userInput;
                                answeredText.push(answered.text);
                            }
                            if (item.items) {
                                item.items.forEach(function (item) {
                                    if (answered) {
                                        if (answered.text === item.text) {
                                            answered.hasSoundOut = item.hasSoundOut;
                                            return;
                                        }
                                    }
                                    var copy = JSON.parse(JSON.stringify(item));
                                    copy.firedOnce = false;
                                    self.answerPool[index].push(copy);
                                });
                            } else {
                                if (answered) {
                                    if (answered.text === item.text) {
                                        answered.hasSoundOut = item.hasSoundOut;
                                        return;
                                    }
                                }
                                var copy = JSON.parse(JSON.stringify(item));
                                copy.firedOnce = false;
                                self.answerPool[index].push(copy);
                            }
                        } else if (item.type === "pro") {
                            if (checkItemAttachmentType(item, "sound-in")) {
                                item.hasSoundIn = true;
                            }
                        }
                    });
                });
                if (noAnswer) {
                    step.check = true;
                }

                step.marplots.forEach(function (item) {
                    gatherSoundOut(item);
                    for (var i = 0; i < answeredText.length; i++) {
                        if (answeredText[i] === item.text) {
                            return;
                        }
                    }
                    var copy = JSON.parse(JSON.stringify(item));
                    copy.firedOnce = false;
                    self.answerPool[index].push(copy);
                });

                self.answerPool[index] = _.shuffle(self.answerPool[index]);
            });

            self.soundTimer = null;
            self.soundSeconds = 0;
            self.startTimer = function () {
                if (self.soundTimer) {
                    console.log("cannot start timer");
                    return;
                }
                self.soundTimer = setInterval(function () {
                    if (!self.onPlay) {
                        return;
                    }
                    self.soundSeconds += 1;
                    self.secondsDisplay = self.soundSeconds + "s";
                }, 1000);
                console.log("timer started");
            };
            self.stopTimer = function () {
                if (self.soundTimer) {
                    clearInterval(self.soundTimer);
                }
                self.soundTimer = null;
                self.soundSeconds = 0;
                self.secondsDisplay = "0s";
                console.log("timer stopped");
            };
        },
        mounted() {
            var self = this;
            var swiper = this.Dom7("#my-swiper-container")[0].swiper;
            swiper.on("onReachEnd", function (swiper) {
                console.log("onReachEnd");
                self.reachFinal = true;

                var course = self.$store.state.learningCourse;
                course.json.learnTime = new Date().getTime();

                var totalRight = 0;
                course.json.lessons.forEach(function (les) {
                    if (les.ok) {
                        totalRight += 1;
                    }
                });
                course.json.totalLessonRight = totalRight;
                course.json.totalLesson = course.json.lessons.length;

                //clean all temporary attributes 
                var courseCopy = JSON.parse(JSON.stringify(course));
                courseCopy.json.lessons.forEach(function (lesson) {
                    lesson.json.steps.forEach(function (step) {
                        delete step.id;
                        step.lines.forEach(function (line) {
                            line.forEach(function (item) {
                                delete item.hasSoundOut;
                                delete item.soundUris;
                                delete item.hasTypeIn;
                                delete item.hasSoundIn;
                                if (item.userInput) {
                                    delete item.userInput.hasSoundOut;
                                    delete item.userInput.soundUris;
                                }
                            });
                        });
                        step.marplots.forEach(function (item) {
                            delete item.hasSoundOut;
                            delete item.soundUris;
                        });
                    });
                });

                courseCopy.content = JSON.stringify(courseCopy.json);//total client content control
                courseCopy.json = null;
                $.ajax(ServerAddress + "saveCourseProgress", {
                    method: "POST",
                    data: {course: JSON.stringify(courseCopy)}
                }).then(function (res) {
                    if (res.errorMessage) {
                        self.$f7.alert(null, res.data.errorMessage);
                    }
                });
            });
            this.mySwiperHandler = function (event) {
                if (event.target.nodeName === "SPAN") {
                    return;
                }
                if (event.key === "ArrowLeft") {
                    swiper.slidePrev();
                } else if (event.key === "ArrowRight") {
                    swiper.slideNext();
                }
            };
            this.Dom7(document).keydown(this.mySwiperHandler);
        },
        methods: {
            clickItemForSound(item) {
                var self = this;
                if (item.hasSoundOut) {
                    item.soundUris.forEach(function (uri) {
                        self.playSound(uri);
                    });
                }
            },
            playSound(myUri) {
                var self = this;
                var uri = new URI(myUri);
                var nuri;
                if (uri.protocol() === "http" || uri.protocol() === "https") {
                    nuri = uri.toString();
                } else if (uri.protocol() === "openwords") {
                    var segs = uri.segment();
                    nuri = "getSound?userId=" + segs[0] + "&fileName=" + segs[1];
                    nuri = ServerAddress + nuri;
                }

                if (self.soundPlaying) {
                    self.soundPlaying.stop();
                }

                self.$f7.showPreloader(self.$t("load-sound"));
                Howler.autoSuspend = false;
                test = self.soundPlaying = new Howl({
                    src: [nuri],
                    format: ["mp3"],
                    //html5: true,
                    onloaderror: function () {
                        self.$f7.hidePreloader();
                        self.$f7.alert(null, self.$t("cannot-play"));
                        self.onReady = false;
                    },
                    onload: function () {
                        console.log("onload");
                        self.$f7.hidePreloader();
                        self.rate = 1;
                    },
                    onplay: function () {
                        console.log("onplay");
                        self.onPlay = true;
                        self.onPause = false;
                        if (this.duration() <= 5) {
                            self.onReady = false;
                        } else {
                            self.onReady = true;
                            self.startTimer();
                        }
                    },
                    onpause: function () {
                        self.onPlay = false;
                        self.onPause = true;
                    },
                    onstop: function () {
                        console.log("onstop");
                        self.onReady = false;
                        self.onPlay = false;
                        self.onPause = false;
                        self.stopTimer();
                    },
                    onend: function () {
                        console.log("onend");
                        self.onReady = false;
                        self.onPlay = false;
                        self.onPause = false;
                        self.stopTimer();
                    }
                });
                self.soundPlaying.play();
            },
            backSeek() {
                this.soundSeconds -= 5;
                if (this.soundSeconds <= 0) {
                    this.soundSeconds = 0;
                }
                this.soundPlaying.seek(this.soundSeconds);
            },
            forwardSeek() {
                this.soundSeconds += 5;
                this.soundPlaying.seek(this.soundSeconds);
            },
            soundRate() {
                if (this.soundPlaying && this.onReady) {
                    if (this.rate >= 1.5) {
                        this.rate = 0.4;
                    }
                    this.rate += 0.1;
                    this.rate = parseFloat(this.rate.toFixed(1));
                    this.soundPlaying.rate(this.rate);
                }
            },
            pauseSound() {
                if (this.onReady && this.onPlay) {
                    this.soundPlaying.pause();
                }
            },
            resumeSound() {
                if (this.onReady && this.onPause) {
                    this.soundPlaying.play();
                }
            },
            typeInDone(index) {
                this.typeinItemIndex = index;
                this.de();
            },
            de: _.debounce(function () {
                var self = this;
                console.log("check");
                var allOk = true;
                var step = self.lesson.json.steps[this.typeinItemIndex];
                step.lines.forEach(function (line) {
                    line.forEach(function (item) {
                        if (item.type === "ans") {
                            if (item.userInput) {
                                item.ok = self.checkAnswerText(item, item.userInput.text);
                            } else {
                                item.ok = false;
                            }
                            if (!item.ok) {
                                allOk = false;
                            }
                        }
                    });
                });

                step.check = allOk;
                self.lesson.ok = checkLesson(self.lesson.json.steps);
                self.$forceUpdate();
            }, 700),
            checkAnswerText(item, incomingText) {
                var i;
                if (item.items) {
                    for (i = 0; i < item.items.length; i++) {
                        if (item.items[i].text === incomingText) {
                            return true;
                        }
                    }
                } else if (item.text) {
                    if (item.text === incomingText) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return false;
            },
            removeAnswerFromPool(a, stepIndex) {
                var pool = this.answerPool[stepIndex];
                for (var i = 0; i < pool.length; i++) {
                    if (pool[i] === a) {
                        pool.splice(i, 1);
                        return;
                    }
                }
            },
            pickAnswer(a, stepIndex) {
                console.log("pickAnswer");
                //undefined is not an object (evaluating 'a.soundUris.length')
                var self = this;
                if (a.hasSoundOut) {
                    //play sound once
                    if (!a.firedOnce && a.soundUris.length) {
                        a.firedOnce = true;
                        a.soundUris.forEach(function (uri) {
                            self.playSound(uri);
                        });
                        if (a.firedOnce) {
                            return;
                        }
                    }
                }

                var foundOne = false;
                var allOk = true;
                var step = self.lesson.json.steps[stepIndex];
                step.lines.forEach(function (line) {
                    line.forEach(function (item) {
                        if (item.type === "ans") {
                            if (!item.userInput && !foundOne) {
                                foundOne = true;
                                delete a.firedOnce;
                                delete a.ok;
                                item.userInput = a;
                                self.removeAnswerFromPool(a, stepIndex);
                            }
                            if (item.userInput) {
                                item.ok = self.checkAnswerText(item, item.userInput.text);
                            } else {
                                item.ok = false;
                            }
                            if (!item.ok) {
                                allOk = false;
                            }
                        }
                    });
                });

                step.check = allOk;
                self.lesson.ok = checkLesson(self.lesson.json.steps);
                self.$forceUpdate();
            },
            removeInput(item, stepIndex) {
                if (item.userInput) {
                    item.userInput.firedOnce = false;
                }
                this.answerPool[stepIndex].push(item.userInput);
                item.userInput = null;
                this.lesson.json.steps[stepIndex].check = false;
                this.lesson.ok = false;
                this.$forceUpdate();
            },
            slideTo(index) {
                var swiper = this.Dom7("#my-swiper-container")[0].swiper;
                swiper.slideTo(index);
            },
            goFinal() {
                var swiper = this.Dom7("#my-swiper-container")[0].swiper;
                swiper.slideTo(this.lesson.json.steps.length);
            },
            sendComment() {
                var self = this;
                if (!self.lessonComment.text) {
                    self.$f7.alert(null, self.$t("comment-sent-message"));
                    return;
                }
                self.lessonComment.done = true;

                var pack = {
                    content: {
                        comment: self.lessonComment.text,
                        name: self.lesson.name,
                        userId: self.lesson.userId,
                        updated: self.lesson.updated
                    }
                };
                pack.content = JSON.stringify(pack.content);

                $.ajax(ServerAddress + "postComment", {
                    method: "POST",
                    data: {comment: JSON.stringify(pack)}
                }).then(function (res) {
                    if (res.errorMessage) {
                        self.$f7.alert(null, res.errorMessage);
                    } else {
                        self.$f7.alert(null, self.$t("comment-sent"));
                    }
                });
            },
            previewOWML() {
                this.owmlText = jsonToOWML(this.lesson.json);
                this.$f7.popup(".popup-OWML-preview");
            }
        },
        beforeDestroy() {
            this.Dom7(document).off("keydown", this.mySwiperHandler);
            if (this.$store.state.pageInstances.courseProgress) {
                this.$store.state.pageInstances.courseProgress.$forceUpdate();
            }
            Howler.unload();
        },
        destroyed() {
            console.log("page-steps destroyed");
        }
    });
}