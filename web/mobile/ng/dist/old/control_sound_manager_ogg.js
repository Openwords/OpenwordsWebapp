myNg.controller("SoundManagerControl", function ($scope, $http, FileUploader, $httpParamSerializerJQLike) {
    navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

    var chunks;
    var mediaRecorder;
    var blob;

    function setup() {
        if (navigator.getUserMedia) {
            console.log("getUserMedia supported");
            chunks = [];

            var onSuccess = function (stream) {
                console.log("getUserMedia onSuccess");

                var types = [
                    "audio/webm;codecs=opus",
                    "audio/webm;codecs=vorbis",
                    "audio/ogg;codecs=vorbis",
                    "audio/ogg;codecs=opus",
                    "audio/webm",
                    "audio/ogg"
                ];

                var supportedMime = "";

                types.forEach(function (type) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        console.log(type + " Yes !!!");
                        supportedMime = type;
                    } else {
                        console.log(type + " No :(((");
                    }
                });

                mediaRecorder = new MediaRecorder(stream, {
                    mimeType: supportedMime,
                    audioBitsPerSecond: 128000
                });
                console.log(mediaRecorder);

                $scope.ok = true;
                $scope.recording = false;
                $scope.canUpload = false;
                $scope.$apply();

                mediaRecorder.ondataavailable = function (e) {
                    chunks.push(e.data);
                };

                mediaRecorder.onstop = function (e) {
                    console.log("mediaRecorder.onstop()");
                    var node = document.getElementById("sound_controls");

                    blob = new Blob(chunks, {"type": supportedMime});
                    chunks = [];
                    var audioURL = window.URL.createObjectURL(blob);

                    var audio = document.createElement("audio");
                    audio.setAttribute("controls", "");
                    audio.setAttribute("style", "width: 100%;");
                    audio.src = audioURL;
                    node.appendChild(audio);

                    $scope.canUpload = true;
                    $scope.$apply();
                };

                visualize(stream);
            };

            var onError = function (error) {
                console.log(error);
                myApp.alert(null, "Audio Error");
            };

            navigator.getUserMedia({audio: true}, onSuccess, onError);
        } else {
            myApp.alert("Please update your browser to its newest version or change a browser", "Web Audio API not supported");
        }
    }

    function clearSoundDemo() {
        var node = document.getElementById("sound_controls");
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    }

    $scope.setup = function () {
        setup();
        clearSoundDemo();
        $scope.soundList.userId = userInfo.userId;
        if ($scope.rootSoundManager.soundValid) {
            listSound($scope.soundList, $http, null, function (list) {
                list.forEach(function (item) {
                    if (item.file === $scope.rootSoundManager.soundFile) {
                        item.use = true;
                    }
                });
            });
        }
    };

    $scope.startRecording = function () {
        mediaRecorder.start();
        $scope.recording = true;
        $scope.canUpload = false;
        clearSoundDemo();
    };

    $scope.stopRecording = function () {
        mediaRecorder.stop();
        $scope.recording = false;
    };

    $scope.soundList = {};

    $scope.uploadRecording = function () {
        var uploader = new FileUploader({
            url: "uploadSound",
            queueLimit: 1
        });
        uploader.onBeforeUploadItem = function (item) {
            item.formData.push({text: $scope.rootSoundManager.item.text[0]});
            item.formData.push({userId: userInfo.userId});
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            var fileName = response.trim();
            updateLessonContentForItemSound($scope, fileName, function (res) {
                if (res.data.errorMessage) {
                    myApp.alert(null, "Upload Fail");
                    return;
                }
                myApp.alert(null, "Upload Success");
                $scope.soundList.userId = userInfo.userId;
                listSound($scope.soundList, $http, null, function (list) {
                    list[0].use = true;
                });
            });
        };
        uploader.onErrorItem = function (fileItem, response, status, headers) {
            myApp.alert(null, "Upload Fail");
        };
        uploader.addToQueue(blob);
        uploader.uploadAll();
    };

    $scope.pickSound = function (sound, index) {
        $scope.soundList.currentSound = sound;
        $scope.soundList.index = index;
        myApp.actions(soundActionButtons);
    };
    var soundActionButtons = [
        {
            text: "Play",
            onClick: function () {
//                var sound = new Howl({
//                    src: ["getSound?userId=" + $scope.soundList.userId + "&fileName=" + $scope.soundList.currentSound.file],
//                    format: ["ogg"],
//                    onloaderror: function () {
//                        myApp.alert(null, "Cannot play audio");
//                    }
//                });
//                sound.play();//firefox mono

                var player = new OGVPlayer({
                    enableWebM: true,
                    debug: true
                });
                player.muted = false;
                document.getElementById("my-audio-2").appendChild(player);
                player.src = "getSound?userId=" + $scope.soundList.userId + "&fileName=" + $scope.soundList.currentSound.file;
                player.play();
            }
        },
        {
            text: "Use this sound",
            onClick: function () {
                $scope.soundList.list.forEach(function (item) {
                    if (item.updated === $scope.soundList.currentSound.updated) {
                        item.use = true;

                        updateLessonContentForItemSound($scope, item.file, function (res) {
                            if (res.data.errorMessage) {
                                myApp.alert(null, "Update Fail");
                                return;
                            }
                        });
                    } else {
                        delete item.use;
                    }
                });
                $scope.$apply();
            }
        },
        {
            text: "Delete",
            color: "red",
            onClick: function () {
                $http({
                    url: "deleteSound",
                    method: "get",
                    params: {userId: $scope.soundList.currentSound.userId,
                        time: $scope.soundList.currentSound.updated}
                }).then(function (res) {
                    var r = res.data;
                    if (!r.errorMessage) {
                        $scope.soundList.list.splice($scope.soundList.index, 1);
                    } else {
                        myApp.alert(null, "Delete fail");
                    }
                });
            }
        },
        {
            text: "Cancel"
        }
    ];

    function updateLessonContentForItemSound($scope, newSoundFileName, done) {
        if (!$scope.rootSoundManager.item.attach) {
            $scope.rootSoundManager.item.attach = [
                [{type: "sound-out"}]
            ];
        }
        $scope.rootSoundManager.item.attach[0].forEach(function (attach) {
            if (attach.type === "sound-out") {
                attach.url = "openwords://user/" + userInfo.userId + "/" + newSoundFileName;
            }
        });
        var StepsControl = getScope("StepsControl");
        $http({
            url: "updateLessonContent",
            method: "post",
            headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
            data: $httpParamSerializerJQLike({
                userId: userInfo.userId,
                name: StepsControl.lesson.name,
                content: angular.toJson(StepsControl.lesson.json)
            })
        }).then(function (res) {
            if (done) {
                done(res);
            }
        });
    }

    function visualize(stream) {
        var audioCtx = new (window.AudioContext || webkitAudioContext)();
        var canvas = document.getElementById("visualizer");
        var canvasCtx = canvas.getContext("2d");

        var source = audioCtx.createMediaStreamSource(stream);
        var analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);
        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;
        draw();
        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);
            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
            canvasCtx.beginPath();
            var sliceWidth = WIDTH * 1.0 / bufferLength;
            var x = 0;
            for (var i = 0; i < bufferLength; i++) {
                var v = dataArray[i] / 128.0;
                var y = v * HEIGHT / 2;
                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        }
    }
});