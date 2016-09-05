function FileUploadControl($scope, $upload) {
    $scope.progressType = "success";
    $scope.started = false;


    $scope.fileUrl = null;
    $scope.showDownloadFile = false;
    $scope.downloadFile = function() {
        var path = $scope.fileUrl;
        window.open(path, '', 'width=480,height=320');
    };

    $scope.onFileSelect = function($files) {
        if (!$scope.langIn) {
            alert("Please specify the code of Language-In");
            return;
        }
        if (!$scope.langOut) {
            alert("Please specify the code of Language-Out");
            return;
        }

        var stop = false;
        //$files: an array of files selected, each file has name, size, and type.
        var file = $files[$files.length - 1];
        if (file.name.indexOf("txt") === -1) {
            alert("Please only upload .txt file");
            return;
        }
        $scope.started = true;
        $scope.showDownloadFile = false;
        var alertShown = false;
        $scope.upload = $upload.upload({
            url: "translateDocument",
            method: "POST",
            data: {langIn: $scope.langIn, langOut: $scope.langOut, place: $scope.place},
            file: file
        }).progress(function(evt) {
            if (stop) {
                return;
            }
            if (!alertShown) {
                alert("Please wait until you see a green button {Download translated file}");
                alertShown = true;
            }
            var progress = parseInt(100.0 * evt.loaded / evt.total);
            $scope.percentage = progress;
            $scope.progressText = progress + "%";
        }).success(function(data) {
            $scope.fileUrl = data.trim();
            $scope.showDownloadFile = true;

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