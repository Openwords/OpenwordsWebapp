myNg.controller("LessonManagerControl", function($scope, $http, FileUploader) {
    var uploader = $scope.uploader = new FileUploader({
        url: "uploadLesson",
        queueLimit: 1
    });

    var name;

    $scope.doUpload = function() {
        myApp.prompt("Please enter a name for the lesson", "Uploading Lesson", function(v) {
            name = v;
            if (name) {
                uploader.uploadAll();
            } else {
                myApp.alert(null, "You've provided invalid information");
            }

        });
    };

    uploader.onBeforeUploadItem = function(item) {
        item.formData.push({userId: userInfo.userId});
        item.formData.push({name: name});
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        uploader.clearQueue();
        myApp.alert(null, "Upload success");
        $scope.listMyLessons(1);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        var m = "";
        if (status === 901) {
            m = "Lessons cannot have the same name";
        }
        myApp.alert(m, "Upload fail");
    };

    $scope.listMyLessons = function(page) {
        $scope.rootMyLessonList.page = page;
        $scope.rootMyLessonList.userId = userInfo.userId;
        listLesson($scope.rootMyLessonList, $http);
    };

    var chosenLesson = null;
    var actionButtons = [
        {
            text: "Preview",
            onClick: function() {
                STEPS = chosenLesson.json.steps;
                var StepsControl = getScope("StepsControl");
                StepsControl.lesson = chosenLesson;
                StepsControl.mode = "preview";
                $$("#back_button_in_steps").once("click", function() {
                    stepOn = false;
                    mainView.router.load({pageName: "lesson_manager"});
                });
                mainView.router.load({pageName: "steps"});
                stepOn = true;
            }
        },
        {
            text: "Immediate Feedback Mode",
            onClick: function() {
                $http({
                    url: "changeLessonMode",
                    method: "get",
                    params: {
                        userId: userInfo.userId,
                        name: chosenLesson.name,
                        imf: true
                    }
                }).then(function(res) {
                    var r = res.data;
                    if (!r.errorMessage) {
                        chosenLesson.imf = true;
                    }
                });
            }
        },
        {
            text: "End Feedback Mode",
            onClick: function() {
                chosenLesson.imf = false;
                $http({
                    url: "changeLessonMode",
                    method: "get",
                    params: {
                        userId: userInfo.userId,
                        name: chosenLesson.name,
                        imf: false
                    }
                }).then(function(res) {
                    var r = res.data;
                    if (!r.errorMessage) {
                        chosenLesson.imf = false;
                    }
                });
            }
        },
        {
            text: "Delete",
            color: "red",
            onClick: function() {
                myApp.confirm("Are you sure to delete Lesson \"" + chosenLesson.name + "\"?",
                        "Deleting Lesson",
                        function() {
                            $http({
                                url: "deleteLesson",
                                method: "get",
                                params: {
                                    userId: userInfo.userId,
                                    name: chosenLesson.name
                                }
                            }).then(function(res) {
                                var r = res.data;
                                if (!r.errorMessage) {
                                    $scope.listMyLessons(1);
                                    myApp.alert(null, "Lesson deleted");
                                }
                            });
                        }
                );
            }
        },
        {
            text: "Cancel"
        }
    ];

    $scope.lessonAction = function(le) {
        chosenLesson = le;
        myApp.actions(actionButtons);
    };
});


