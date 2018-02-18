function defineCompSoundIn() {
    Vue.component("comp-sound-in", {
        template: "#comp_sound_in",
        props: ["text", "list", "myIconSize"],
        data() {
            return{
                recording: false,
                recordingDone: false
            };
        },
        created() {
            this.list.push(this);
            this.audioContext = null;
            var self = this;
            this.worker = new Worker("libs/dist/EncoderWorker.js");
            self.worker.onmessage = function (event) {
                //encoding finished
                self.blob = event.data.blob;
                self.recording = false;
                self.recordingDone = true;
            };
            this.blob = null;
            this.input = null;
            this.processor = null;
            this.microphone = null;
            this.localMediaStream = null;
        },
        methods: {
            forfeitRecording() {
                this.recordingDone = false;
                this.cancelRecording();
            },
            cancelRecording() {
                this.localMediaStream.getTracks().forEach(function (streamTrack) {
                    streamTrack.stop();
                });
                if (this.audioContext.destination) {
                    this.audioContext.destination.disconnect();
                    this.audioContext.close();
                }
                if (this.processor) {
                    this.processor.disconnect();
                }
                this.input.disconnect();
                this.microphone.disconnect();
                this.recording = false;
            },
            startRecording() {
                this.list.forEach(function (comp) {
                    if (comp.audioContext) {
                        comp.cancelRecording();
                    }
                });
                this.recording = false;
                this.audioURL = null;
                var self = this;

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

                    self.input = self.audioContext.createGain();
                    self.input.gain.value = 1;

                    function start() {
                        console.log("recording...");
                        self.recording = true;
                        self.processor = self.audioContext.createScriptProcessor(0, 2, 2);
                        console.log("default BufferSize: " + self.processor.bufferSize);
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
                    }

                    navigator.mediaDevices.getUserMedia({audio: true})
                            .then(function (stream) {
                                self.microphone = self.audioContext.createMediaStreamSource(stream);
                                self.microphone.connect(self.input);
                                self.localMediaStream = stream;
                                start();
                            })
                            .catch(function (error) {
                                console.log(error);
                                self.$f7.alert(null, self.$t("audio-error"));
                            });
                } else {
                    self.$f7.alert(self.$t("audio-error-message"), self.$t("api-error"));
                }
            },
            playRecording() {
                var self = this;
                if (!self.audioURL) {
                    self.audioURL = window.URL.createObjectURL(self.blob);
                }
                new Howl({
                    src: [self.audioURL],
                    format: ["mp3"],
                    onloaderror: function () {
                        self.$f7.alert(null, self.$t("onload-error"));
                    }
                }).play();
            },
            stopRecording(finish) {
                var self = this;
                self.input.disconnect();
                self.processor.disconnect();
                self.worker.postMessage({
                    command: finish ? "finish" : "cancel"
                });
            }
        },
        destroyed() {
            var self = this;
            this.list.forEach(function (item, index, array) {
                if (item === self) {
                    array.splice(index, 1);
                    console.log("soundInList: " + array.length);
                }
            });
            if (this.localMediaStream) {
                this.cancelRecording();
            }
            this.worker.terminate();
            console.log("comp_sound-in destroyed");
        }
    });
}




