myNg.controller("StepsControl", function($scope, $http, $httpParamSerializerJQLike) {
    $scope.lesson = null;
    $scope.mode = null;
    $scope.studyState = {
        reachFinal: false
    };

    $scope.saveStudyState = function(course) {
        $scope.studyState.reachFinal = true;

    };
});

myNg.controller("StepPageControl", function($scope, $http, $httpParamSerializerJQLike) {
    $scope.myIndex;
    $scope.step;
    $scope.answerPool = [];

    $scope.init = function(index) {
        $scope.myIndex = index;
        $scope.step = STEPS[index];

        if (!$scope.step.final) {
            var noAnswer = true;
            $scope.step.lines.forEach(function(line) {
                line.forEach(function(item) {
                    if (item.type === "ans") {
                        noAnswer = false;
                        item.text.forEach(function(answer) {
                            $scope.answerPool.push({type: "ans", text: answer});
                        });
                    }
                });
            });
            if (noAnswer) {
                $scope.step.check = true;
            }

            $scope.step.marplots.forEach(function(group) {
                group.text.forEach(function(mar) {
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

    $scope.pickAnswer = function(a) {
        var found = false;
        var allOk = true;
        $scope.step.lines.forEach(function(line) {
            line.forEach(function(item) {
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

    $scope.removeInput = function(item) {
        $scope.answerPool.push({text: item.userInput});
        item.userInput = null;
        $scope.step.check = false;
        $scope.lesson.ok = false;
    };

    $scope.slideTo = function(index) {
        stepsUI.slideTo(index);
    };

    $scope.lessonComment = {
        done: false
    };
    $scope.sendComment = function() {
        $scope.lessonComment.done = true;
        var pack = JSON.parse(angular.toJson($scope.lesson));
        delete pack.content;
        delete pack.json;
        delete pack.langOne;
        delete pack.langTwo;
        delete pack.ok;
        pack.comment = $scope.lessonComment.text;

        $scope.lessonComment.content = angular.toJson(pack);
        $scope.lessonComment.userId = userInfo.userId;
        

    };
});
