importScripts("Mp3LameEncoder.min.js");

var buffers = undefined,
        encoder = undefined;

addEventListener("message", function (event) {
    var data = event.data;
    switch (data.command) {
        case "start":
            encoder = new Mp3LameEncoder(data.sampleRate, data.bitRate);
            buffers = [];
            break;
        case "record":
            buffers.push(data.buffers);
            break;
        case "finish":
            while (buffers.length > 0) {
                encoder.encode(buffers.shift());
            }
            self.postMessage({
                blob: encoder.finish()
            });
            encoder = undefined;
            break;
        case "cancel":
            encoder.cancel();
            encoder = undefined;
            break;
        default:
            break;
    }
}, false);
