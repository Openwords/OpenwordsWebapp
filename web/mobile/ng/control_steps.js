myNg.controller("StepsControl", function ($scope, $http, $httpParamSerializerJQLike) {
    $scope.lesson = null;
    $scope.mode = null;
    $scope.studyState = {
        reachFinal: false
    };

    $scope.saveStudyState = function (course) {
        $scope.studyState.reachFinal = true;
        course.json.learnTime = new Date().getTime();

        var totalRight = 0;
        course.json.lessons.forEach(function (les) {
            if (les.ok) {
                totalRight += 1;
            }
        });
        course.json.totalLessonRight = totalRight;
        course.json.totalLesson = course.json.lessons.length;

        course.content = angular.toJson(course.json);//total client content control
        $http({
            url: "saveCourseProgress",
            method: "post",
            headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
            data: $httpParamSerializerJQLike({
                course: angular.toJson(course)
            })
        }).then(function (res) {
            $scope.studyState.reachFinal = true;
            course.content = null;
            if (res.data.errorMessage) {
                myApp.alert(null, res.data.errorMessage);
            }
        });
    };
});

myNg.controller("StepPageControl", function ($scope, $http, $httpParamSerializerJQLike) {
    $scope.myIndex;
    $scope.step;
    $scope.answerPool = [];

    var soundActionButtons = [
        {
            text: "Record new sound",
            onClick: function () {
                stepRe = false;
                mainView.router.load({pageName: "sound_manager"});
                getScope("SoundManagerControl").setup();
            }
        },
        {
            text: "Play sound",
            soundUrl: "hi",
            onClick: function () {
                var sound = new Howl({
                    src: [this.soundUrl],
                    format: ["mp3"],
                    onloaderror: function () {
                        myApp.alert(null, "Cannot play audio");
                    }
                });
                sound.play();//firefox mono
            }
        },
        {
            text: "Cancel"
        }
    ];

    $scope.proSoundOut = function (item) {
        $scope.rootSoundManager.item = item;
        var thisActions = [];
        var hasSound = false;
        if (item.attach) {
            var i;
            for (i = 0; i < item.attach[0].length; i++) {
                if (item.attach[0][i].type === "sound-out") {
                    if (item.attach[0][i].url) {
                        var uri = new URI(item.attach[0][i].url);
                        var segs = uri.segment();
                        var nurl = "getSound?userId=" + segs[0] + "&fileName=" + segs[1];
                        soundActionButtons[1].soundUrl = nurl;
                        hasSound = true;

                        $scope.rootSoundManager.soundValid = true;
                        $scope.rootSoundManager.soundFile = segs[1];

                        if ($scope.mode === "exam") {
                            var sound = new Howl({
                                src: [nurl],
                                format: ["mp3"],
                                onloaderror: function () {
                                    myApp.alert(null, "Cannot play audio");
                                }
                            });
                            sound.play();
                        }
                        break;
                    }
                }
            }
        }
        if ($scope.mode === "preview") {
            thisActions.push(soundActionButtons[0]);
            if (hasSound) {
                thisActions.push(soundActionButtons[1]);
            }
            thisActions.push(soundActionButtons[2]);
            myApp.actions(thisActions);
        }
    };

    $scope.hasProSoundOut = function (item) {
        if (item.attach) {
            var i;
            for (i = 0; i < item.attach[0].length; i++) {
                if (item.attach[0][i].type === "sound-out") {
                    return true;
                }
            }
            return false;
        }
        return false;
    };

    $scope.init = function (index) {
        $scope.myIndex = index;
        $scope.step = STEPS[index];

        if (!$scope.step.final) {
            var noAnswer = true;
            $scope.step.lines.forEach(function (line) {
                line.forEach(function (item) {
                    if (item.type === "ans") {
                        noAnswer = false;
                        item.text.forEach(function (answer) {
                            $scope.answerPool.push({type: "ans", text: answer});
                        });
                    }
                });
            });
            if (noAnswer) {
                $scope.step.check = true;
            }

            $scope.step.marplots.forEach(function (group) {
                group.text.forEach(function (mar) {
                    $scope.answerPool.push({type: "mar", text: mar});
                });
            });

            if ($scope.mode === "exam") {
                shuffle($scope.answerPool);
            }
        } else {
            $scope.steps = STEPS;
        }
    };

    function removeAnswerFromPool(a) {
        for (var i = 0; i < $scope.answerPool.length; i++) {
            if ($scope.answerPool[i] === a) {
                $scope.answerPool.splice(i, 1);
            }
        }
    }

    $scope.pickAnswer = function (a) {
        var found = false;
        var allOk = true;
        $scope.step.lines.forEach(function (line) {
            line.forEach(function (item) {
                if (item.type === "ans") {
                    if (!item.userInput && !found) {
                        found = true;
                        item.userInput = a.text;
                        removeAnswerFromPool(a);
                    }
                    item.ok = checkAnswerText(item.text, item.userInput);
                    if (!item.ok) {
                        allOk = false;
                    }
                }
            });
        });

        $scope.step.check = allOk;
        $scope.lesson.ok = checkLesson(STEPS);
    };

    function checkAnswerText(all, incoming) {
        for (var i = 0; i < all.length; i++) {
            if (all[i] === incoming) {
                return true;
            }
        }
        return false;
    }

    $scope.removeInput = function (item) {
        $scope.answerPool.push({text: item.userInput});
        item.userInput = null;
        $scope.step.check = false;
        $scope.lesson.ok = false;
    };

    $scope.slideTo = function (index) {
        stepsUI.slideTo(index);
    };

    $scope.lessonComment = {
        done: false
    };
    $scope.sendComment = function () {
        if (!$scope.lessonComment.text) {
            myApp.alert(null, "Please say something");
            return;
        }
        $scope.lessonComment.done = true;
        var pack = JSON.parse(angular.toJson($scope.lesson));
        delete pack.content;
        delete pack.json;
        delete pack.langOne;
        delete pack.langTwo;
        delete pack.ok;
        pack.comment = $scope.lessonComment.text;

        $scope.lessonComment.content = angular.toJson(pack);
        $http({
            url: "postComment",
            method: "post",
            headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
            data: $httpParamSerializerJQLike({
                comment: angular.toJson($scope.lessonComment)
            })
        }).then(function (res) {
            if (res.data.errorMessage) {
                myApp.alert(null, res.data.errorMessage);
            } else {
                myApp.alert(null, "Comment Sent");
            }
        });

    };
});


