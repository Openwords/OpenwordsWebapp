myNg.controller("CourseEditControl", function($scope, $http) {
    $scope.courseContentChanged = [false];

    $scope.addLesson = function() {
        myApp.popup(".popup-choose-lesson");
        $scope.courseContentChanged[0] = true;
    };

    var chosenLesson = null;
    var lessonArray = null;
    var actionButtons = [
        {
            text: "Move up",
            onClick: function() {
                if (chosenLesson > 0) {
                    var les = lessonArray[chosenLesson];
                    var itemGoDown = lessonArray[chosenLesson - 1];
                    lessonArray[chosenLesson - 1] = les;
                    lessonArray[chosenLesson] = itemGoDown;
                    $scope.$apply();
                    $scope.courseContentChanged[0] = true;
                }
            }
        },
        {
            text: "Move down",
            onClick: function() {
                if (chosenLesson < lessonArray.length - 1) {
                    var les = lessonArray[chosenLesson];
                    var itemGoUp = lessonArray[chosenLesson + 1];
                    lessonArray[chosenLesson + 1] = les;
                    lessonArray[chosenLesson] = itemGoUp;
                    $scope.$apply();
                    $scope.courseContentChanged[0] = true;
                }
            }
        },
        {
            text: "Remove",
            color: "red",
            onClick: function() {
                lessonArray.splice(chosenLesson, 1);
                $scope.$apply();
                $scope.courseContentChanged[0] = true;
            }
        },
        {
            text: "Cancel"
        }
    ];

    $scope.lessonAction = function(index, array) {
        chosenLesson = index;
        lessonArray = array;
        myApp.actions(actionButtons);
    };
});


