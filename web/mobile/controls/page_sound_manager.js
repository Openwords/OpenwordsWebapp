function defineSoundManagerPage() {
    Vue.component("page-sound-manager", {
        template: "#page_sound_manager",
        computed: {
            itemSound() {
                return this.$store.state.editItemSound;
            },
            lesson() {
                return this.$store.state.lessonPreview;
            }
        },
        data() {
            return{
                recording: false,
                canUpload: false,
                ok: false,
                addFile: false,
                soundList: null,
                uploadSound: null,
                soundFileName: null
            };
        },
        created() {
            this.audioContext = null;
            this.audioCtx = null;
            this.worker = null;
            this.blob = null;
            this.input = null;
            this.processor = null;
            this.microphone = null;
            this.localMediaStream = null;
        },
        mounted() {
            var self = this;
            $.ajax({
                url: ServerAddress + "listSound"
            }).done(function (res) {
                if (res.errorMessage) {
                    self.$f7.alert(res.errorMessage, self.$t("error"));
                    return;
                }
                self.soundList = res.result;

                self.soundList.forEach(function (item) {
                    item.dateString = moment(item.updated).format("MMM D, HH:mm");
                    if (self.$store.state.editItemSound.soundValid &&
                            item.file === self.$store.state.editItemSound.soundFile) {
                        item.use = true;
                    }
                });

            });

            this.recording = false;
            var self = this;

            function visualize(stream) {
                self.audioCtx = new (window.AudioContext || webkitAudioContext)();
                var canvas = document.getElementById("visualizer");
                var canvasCtx = canvas.getContext("2d");

                var source = self.audioCtx.createMediaStreamSource(stream);
                var analyser = self.audioCtx.createAnalyser();
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

            if (navigator.mediaDevices === undefined) {
                navigator.mediaDevices = {};
                console.log("navigator.mediaDevices not supported");
            }

            if (navigator.mediaDevices.getUserMedia) {
                /*
                 * microphone->input->processor->destination
                 */
                self.audioContext = new AudioContext();
                if (self.audioContext.createScriptProcessor === null) {
                    self.audioContext.createScriptProcessor = self.audioContext.createJavaScriptNode;
                }

                self.defaultBufferSize = self.audioContext.createScriptProcessor(undefined, 2, 2).bufferSize;
                console.log("defaultBufferSize: " + self.defaultBufferSize);
                self.input = self.audioContext.createGain();
                self.input.gain.value = 1;

                // recording process
                self.worker = new Worker("libs/dist/EncoderWorker.js");
                self.worker.onmessage = function (event) {
                    //worker finished
                    self.blob = event.data.blob;
                    var node = document.getElementById("sound_controls");
                    var audioURL = window.URL.createObjectURL(self.blob);

                    var audio = document.createElement("audio");
                    audio.setAttribute("controls", "");
                    audio.setAttribute("style", "width: 100%;");
                    audio.src = audioURL;
                    node.appendChild(audio);

                    self.canUpload = true;
                };

                navigator.mediaDevices.getUserMedia({audio: true})
                        .then(function (stream) {
                            self.microphone = self.audioContext.createMediaStreamSource(stream);
                            self.microphone.connect(self.input);
                            visualize(stream);
                            self.localMediaStream = stream;
                            self.ok = true;
                            self.recording = false;
                            self.canUpload = false;
                        })
                        .catch(function (error) {
                            console.log(error);
                            self.$f7.alert(null, self.$t("audio-error"));
                        });
            } else {
                self.$f7.alert(self.$t("audio-error-message"), self.$t("api-error"));
            }

            var dropzone = self.dropzone = new Dropzone("#sound-upload", {
                url: ServerAddress + "uploadSound",
                params: {
                    text: self.itemSound.item.text,
                    type: "mp3"
                },
                maxFiles: 1,
                autoProcessQueue: false,
                acceptedFiles: ".mp3"
            });
            dropzone.on("addedfile", function (file) {
                if (file.name) {
                    self.soundFileName = file.name;
                    var audioURL = window.URL.createObjectURL(file);
                    self.uploadSound = new Howl({
                        src: [audioURL],
                        format: ["mp3"],
                        onloaderror: function () {
                            self.addFile = false;
                            self.$f7.alert(null, self.$t("onload-error"));
                        },
                        onload: function () {
                            self.addFile = true;
                        }
                    });
                } else {
                    file.name = "test.mp3";
                }
            });
            dropzone.on("success", function (file, xhr) {
                this.removeAllFiles();
                self.addFile = false;
                var fileName = xhr.trim();
                console.log(fileName);
                self.updateLessonContentForItemSound(fileName);
                $.ajax({
                    url: ServerAddress + "listSound"
                }).done(function (res) {
                    if (res.errorMessage) {
                        self.$f7.alert(res.errorMessage, self.$t("error"));
                        return;
                    }
                    res.result[0].use = true;
                    self.soundList = res.result;
                    self.soundList.forEach(function (item) {
                        if (!item.use) {
                            item.dateString = moment(item.updated).format("MMM D, HH:mm");
                        }
                    });
                    self.$f7.alert(null, self.$t("upload-success"));
                });
            });

        },
        methods: {
            playFile() {
                this.uploadSound.play();
            },
            cancelFile() {
                this.dropzone.removeAllFiles();
                this.uploadSound.stop();
                this.addFile = false;
            },
            pickSound(soundItem, index) {
                var self = this;
                self.$f7.actions([
                    {
                        text: self.$t("play"),
                        onClick: function () {
                            var sound = new Howl({
                                src: [ServerAddress + "getSound?userId=" + soundItem.userId + "&fileName=" + soundItem.file],
                                format: ["mp3"],
                                onloaderror: function () {
                                    self.$f7.alert(null, self.$t("cannot-play"));
                                }
                            });
                            sound.play();//firefox mono 
                        }
                    },
                    {
                        text: self.$t("use-this-sound"),
                        onClick: function () {
                            self.soundList.forEach(function (item) {
                                if (item === soundItem) {
                                    item.use = true;

                                    self.updateLessonContentForItemSound(item.userId + "/" + item.file);
                                } else {
                                    delete item.use;
                                    item.dateString = moment(item.updated).format("MMM D, HH:mm");
                                }
                            });
                            self.$forceUpdate();
                        }
                    },
                    {
                        text: self.$t("delete"),
                        color: "red",
                        onClick: function () {
                            var params = {
                                time: soundItem.updated
                            };
                            $.get(ServerAddress + "deleteSound", params, function (res) {
                                if (!res.errorMessage) {
                                    self.soundList.splice(index, 1);
                                } else {
                                    self.$f7.alert(null, self.$t("delete-fail"));
                                }
                            });
                        }
                    },
                    {
                        text: self.$t("cancel")
                    }
                ]);
            },
            updateLessonContentForItemSound: function (newSoundFileName) {
                var self = this;
                if (!self.itemSound.item.attach) {
                    self.itemSound.item.attach = [
                        {type: "sound-out"}
                    ];
                }
                var found = false;
                self.itemSound.item.attach.forEach(function (attach) {
                    if (found) {
                        return;
                    }
                    if (attach.type === "sound-out") {
                        attach.uri = "openwords://user/" + newSoundFileName;
                        found = true;
                    }
                });
                if (!found) {
                    self.itemSound.item.attach.push({
                        type: "sound-out",
                        uri: "openwords://user/" + newSoundFileName
                    });
                }
                self.$store.state.pageInstances.lessonPreview.lessonContentChanged = true;
            },
            clearSoundDemo() {
                var node = document.getElementById("sound_controls");
                while (node.hasChildNodes()) {
                    node.removeChild(node.lastChild);
                }
            },
            startRecording() {
                this.clearSoundDemo();
                this.recording = true;
                this.canUpload = false;
                var self = this;
                self.processor = self.audioContext.createScriptProcessor(self.defaultBufferSize, 2, 2);
                self.processor.onaudioprocess = function (event) {
                    self.worker.postMessage({
                        command: "record",
                        buffers: getChannelBuffers(event)
                    });
                };
                self.input.connect(self.processor);
                self.processor.connect(self.audioContext.destination);

                self.worker.postMessage({
                    command: "start",
                    sampleRate: self.audioContext.sampleRate,
                    bitRate: 128
                });
            },
            stopRecording(finish) {
                var self = this;
                self.input.disconnect();
                self.processor.disconnect();
                self.worker.postMessage({
                    command: finish ? "finish" : "cancel"
                });
                self.recording = false;
            },
            uploadSoundFile() {
                this.dropzone.processQueue();
            },
            uploadRecording() {
                this.dropzone.removeAllFiles();
                this.dropzone.addFile(this.blob);
                this.dropzone.processQueue();
                this.canUpload = false;
            }
        },
        beforeDestroy() {
            console.log("page-sound-manager beforeDestroy");
            this.localMediaStream.getTracks().forEach(function (streamTrack) {
                streamTrack.stop();
            });
            this.audioContext.destination.disconnect();
            if (this.processor) {
                this.processor.disconnect();
            }
            this.input.disconnect();
            this.microphone.disconnect();
            this.audioCtx.close();
            this.audioContext.close();
            if (this.$store.state.pageInstances.lessonPreview) {
                this.$store.state.pageInstances.lessonPreview.$forceUpdate();
            }
        },
        destroyed() {
            console.log("page-sound-manager destroyed");
        }
    });
}

