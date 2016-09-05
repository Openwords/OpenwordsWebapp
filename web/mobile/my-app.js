// Initialize app and store it to myApp variable for futher access to its methods
var myApp = new Framework7({
    showBarsOnPageScrollEnd: false,
    showBarsOnPageScrollTop: false,
    hideNavbarOnPageScroll: true,
    swipeBackPage: false
});

// We need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var myNg = angular.module("OpenwordsApp", ["angularFileUpload"]);

// Add view
var mainView = myApp.addView(".view-main", {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
    domCache: true
});

function getScope(id) {
    return angular.element(document.getElementById(id)).scope();
}

var userInfo;

myApp.onPageInit("course_list", function(page) {
    console.log("course_list init");
});

myApp.onPageReinit("course_list", function(page) {
    console.log("course_list re");
    getScope("CourseListControl").listCourses(1);
});

var STEPS;
var stepsUI = null;
var stepOn = false;
myApp.onPageInit("steps", function(page) {
    console.log("steps init");
    stepsUI = myApp.swiper(".swiper-container", {
        pagination: ".swiper-pagination",
        grabCursor: true,
        spaceBetween: 80
    });
    stepsUI.on("onSlideChangeEnd", function() {
        var StepsControl = getScope("StepsControl");
        if (stepsUI.activeIndex === StepsControl.lesson.json.steps.length - 1) {
            if (StepsControl.lesson.json.steps[stepsUI.activeIndex].final) {
                StepsControl.lesson.ok = checkLesson(STEPS);
                StepsControl.saveStudyState(getScope("CourseProgressControl").course);
            }
        }
    });

    $$.ajax({
        url: "slide.html",
        success: function(data) {
            buildStepPage(data);
        }
    });

    $$(document).keydown(function(event) {
        if (stepOn) {
            if (event.keyCode === 37) {
                stepsUI.slidePrev();
            } else if (event.keyCode === 39) {
                stepsUI.slideNext();
            }
            console.log("keydown");
        }
    });
});

function buildStepPage(html) {
    for (var i = 0; i < STEPS.length; i++) {
        stepsUI.appendSlide(html.replace("id=\"step_page_id\"", "id=\"step_page_" + i + "\"")
                .replace("ng-init=\"init()\"", "ng-init=\"init(" + i + ")\""));

        var content = $$("#step_page_" + i);
        angular.element(document.getElementById("StepsControl")).injector().invoke(function($compile) {
            var scope = angular.element(content).scope();
            $compile(content)(scope);
            scope.$apply();
        });
    }
}

myApp.onPageReinit("steps", function(page) {
    console.log("steps re");
    stepsUI.removeAllSlides();
    $$.ajax({
        url: "slide.html",
        success: function(data) {
            buildStepPage(data);
        }
    });
});

myApp.onPageReinit("course_lessons", function(page) {
    console.log("course_lessons");
    var scope = getScope("LessonListControl");
});

function checkLesson(steps) {
    for (var i = 0; i < steps.length - 1; i++) {
        if (!steps[i].check) {
            return false;
        }
    }
    return true;
}

