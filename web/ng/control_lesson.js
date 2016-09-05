App.controller("RootControl", function($scope, $sce) {

    $scope.lesson = [
        {
            pType: "fb",
            problemLines: [
                {items: ["Today is Monday."], tags: []},
                {items: ["@", "是", "@", "。"], tags: []}
            ],
            answers: [
                {items: ["今天", "今日"], tags: []},
                {items: ["星期一"], tags: []}
            ],
            marplots: {items: ["明天", "昨天", "星期日"], tags: []},
            done: true,
            answerDisplay: ["星期日", "星期一", "昨天", "今天", "明天", "今日"]
        },
        {
            pType: "fb",
            problemLines: [
                {items: ["I am a cat."], tags: []},
                {items: ["@", "@", "@", "@"], tags: []}
            ],
            answers: [
                {items: ["我"], tags: []},
                {items: ["是"], tags: []},
                {items: ["一只"], tags: []},
                {items: ["猫。"], tags: []}
            ],
            marplots: {items: ["你", "不是", "狗。", "一支"], tags: []},
            done: true,
            answerDisplay: ["猫。", "一支", "我", "是", "一只", "狗。", "你", "不是"]
        },
        {
            pType: "fb",
            problemLines: [
                {items: ["Je", "@", "au travail."], tags: []}
            ],
            answers: [
                {items: ["marche"], tags: []}
            ],
            marplots: {items: ["marchons", "marchent", "marchais"], tags: []},
            done: true,
            answerDisplay: ["marchons", "marche", "marchent", "marchais"]
        },
        {
            problemLines: [
                {items: [], tags: []}
            ],
            answers: [
            ],
            marplots: {items: [], tags: []},
            done: false
        }
    ];

    $scope.updateType = function(p) {
        if (p.pType === "sm") {
            p.problemLines = [{items: [], tags: [{text: ""}]}];
            p.answers = [{items: [], tags: [{text: ""}]}];
            p.marplots = {items: [], tags: []};
            p.done = false;
        } else if (p.pType === "fb") {
            p.problemLines = [];
            p.answers = [];
            p.marplots = {items: [], tags: []};
            p.done = false;
        } else if (p.pType === "ss") {
            p.problemLines = [{items: [], tags: [{text: ""}]}];
            p.answers = [{items: [], tags: []}];
            p.marplots = {items: [], tags: []};
            p.done = false;
        }
    };

    $scope.addNextProblem = function() {
        $scope.lesson.push({
            problemLines: [{items: [], tags: []}],
            answers: [],
            marplots: {items: [], tags: []},
            done: false,
            answerDisplay: []
        });
    };

    $scope.deleteProblem = function(index) {
        $scope.lesson.splice(index, 1);
    };

    $scope.showLastAdd = function(index) {
        if (index === $scope.lesson.length - 1) {
            if ($scope.lesson[index].done) {
                return true;
            }
        }
        return false;
    };

    $scope.addProblemLine = function(problemLines) {
        problemLines.push({
            items: [], tags: []
        });
    };

    $scope.problemItemAdded = function(problem) {
        problem.answers = [];
        problem.problemLines.forEach(function(line) {
            line.tags.forEach(function(tag, index) {
                tag.id = index;
                if (tag.text.indexOf("@") > -1) {
                    problem.answers.push({
                        items: [], tags: []
                    });
                }
            });
        });
    };

    $scope.sentenceItemAdded = function(tags) {
        tags.forEach(function(tag, index) {
            tag.id = index;
        });
    };

    $scope.addBlankItem = function(problem, line) {
        line.tags.push({text: "@", id: line.tags.length});

        problem.answers = [];
        problem.problemLines.forEach(function(line) {
            line.tags.forEach(function(tag) {
                if (tag.text.indexOf("@") > -1) {
                    problem.answers.push({
                        items: [], tags: []
                    });
                }
            });
        });
    };

    $scope.confirmProblem = function(problem) {
        if (problem.pType === "ss") {
            var tags = [];
            var answers = [];
            var i;
            for (i = 0; i < problem.answers[0].tags.length; i++) {
                tags.push({text: "@", id: i});//make the blanks
                answers.push({items: [], tags: [problem.answers[0].tags[i]]});//remake answers 
            }

            problem.problemLines.push({items: [], tags: tags});//add the second line
            problem.answers = answers;
        }

        problem.problemLines.forEach(function(line) {
            line.tags.forEach(function(tag) {
                line.items.push(tag.text);
            });
        });

        problem.answerDisplay = [];
        problem.answers.forEach(function(answer) {
            answer.tags.forEach(function(tag) {
                answer.items.push(tag.text);
                problem.answerDisplay.push(tag.text);
            });
        });

        problem.marplots.tags.forEach(function(tag) {
            problem.marplots.items.push(tag.text);
            problem.answerDisplay.push(tag.text);
        });

        problem.done = true;
        problem.answerDisplay.sort(function() {
            return 0.5 - Math.random();
        });
    };

    $scope.displayProblemLine = function(line) {
        var html = "";
        var totalBlank = 0;
        line.items.forEach(function(item) {
            if (S(item).contains("@")) {
                totalBlank += 1;
                html += "<span class='form-inline'><input type='text' style='width: 50px; color: #000000;' class='form-control'/></span>";
            } else {
                html += "<span>" + item + "</span>";
            }
        });
        if (totalBlank === line.items.length) {
            console.log("big blank");
            return $sce.trustAsHtml("<input type='text' style='width: 120px; color: #000000;' class='form-control'/>");
        }
        return $sce.trustAsHtml(html);
    };

    $scope.downloadLesson = function() {
        var out = "";
        $scope.lesson.forEach(function(problem) {
            out += "=" + problem.pType + "\r\n";

            problem.problemLines.forEach(function(line) {
                out += "*";
                line.items.forEach(function(item) {
                    if (item.indexOf("@") > -1) {
                        out += "[@]";
                    } else {
                        out += "[" + item + "]";
                    }
                });
                out += "\r\n";
            });

            problem.answers.forEach(function(answer) {
                out += "#";
                answer.items.forEach(function(item) {
                    out += "[" + item + "]";
                });
                out += "\r\n";
            });

            out += "%";
            problem.marplots.items.forEach(function(item) {
                out += "[" + item + "]";
            });

            out += "\r\n\r\n\r\n";
        });

        var blob = new Blob([out], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "your_lesson.txt");
    };
});

