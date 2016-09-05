function TranscriptionUploadControl($scope, $upload) {
    $scope.progressType = "success";
    $scope.started = false;

    $scope.onFileSelect = function($files) {
        var stop = false;
        //$files: an array of files selected, each file has name, size, and type.
        var file = $files[$files.length - 1];
        if (file.name.indexOf("txt") === -1) {
            alert("Please only upload .txt file");
            return;
        }
        $scope.started = true;
        $scope.upload = $upload.upload({
            url: "updateTranscription",
            method: "POST",
            file: file
        }).progress(function(evt) {
            if (stop) {
                return;
            }
            var progress = parseInt(100.0 * evt.loaded / evt.total);
            $scope.percentage = progress;
            $scope.progressText = progress + "%";
        }).success(function(data) {
            stop = true;
            $scope.started = false;
            $scope.percentage = 100;
            $scope.progressType = "success";
            $scope.progressText = file.name + " upload success";
        }).error(function(data) {
            stop = true;
            $scope.started = false;
            $scope.percentage = 100;
            $scope.progressType = "danger";
            $scope.progressText = file.name + " upload failed";
            alert(data);
        });
    };
}