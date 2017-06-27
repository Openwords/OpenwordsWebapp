function listCourse(pack, http, done) {
    pack.canLookAfter = false;

    http({
        url: "listCourse",
        method: "get",
        params: {pageNumber: pack.page,
            pageSize: pack.pageSize,
            authorId: pack.authorId,
            my: pack.my,
            user: pack.user,
            all: pack.all}
    }).then(function (res) {
        var r = res.data;
        if (r.errorMessage) {
            console.error(r.errorMessage);
            return;
        }

        if (r.result.length === 0) {
            pack.list = null;
            return;
        }

        if (r.result.length > pack.pageSize) {
            pack.canLookAfter = true;
            r.result.pop();
        }
        pack.list = r.result;

        //test
        pack.list.forEach(function (c) {
            var i = Math.floor(Math.random() * 9) + 1;
            c.fileCover = "img/test" + i + ".jpg";
        });

        if (done) {
            done(pack.list);
        }
    });
}

function listLesson(pack, http) {
    pack.canLookAfter = false;

    http({
        url: "listLesson",
        method: "get",
        params: {pageNumber: pack.page,
            pageSize: pack.pageSize}
    }).then(function (res) {
        var r = res.data;
        if (r.errorMessage) {
            console.error(r.errorMessage);
            return;
        }

        if (r.result.length === 0) {
            pack.list = null;
            return;
        }

        if (r.result.length > pack.pageSize) {
            pack.canLookAfter = true;
            r.result.pop();
        }
        pack.list = r.result;
    });
}

function listSound(pack, http, error, done) {
    http({
        url: "listSound",
        method: "get"
    }).then(function (res) {
        var r = res.data;
        if (r.errorMessage) {
            if (error) {
                error(r.errorMessage);
            }
            return;
        }
        pack.list = r.result;
        if (done) {
            done(pack.list);
        }
    });
}