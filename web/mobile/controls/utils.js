function listCourse(pack, error, done) {
    pack.canLookAfter = false;
    $.ajax({
        url: ServerAddress + "listCourse",
        data: {
            pageNumber: pack.page,
            pageSize: pack.pageSize,
            authorId: pack.authorId,
            my: pack.my,
            user: pack.user,
            all: pack.all,
            courseNameSearch: pack.courseNameSearch
        }
    }).done(function (res) {
        if (res.errorMessage) {
            if (error) {
                error(res.errorMessage);
            }
            return;
        }
        if (res.result.length === 0) {
            pack.list = null;
            if (error) {
                error("no-results");
            }
            return;
        }
        if (res.result.length > pack.pageSize) {
            pack.canLookAfter = true;
            res.result.pop();
        }
        pack.list = res.result;
        //test
        pack.list.forEach(function (c) {
            var i = Math.floor(Math.random() * 9) + 1;
            c.fileCover = "img/test" + i + ".jpg";
            c.dateString = moment(c.makeTime).format("LL");
            c.displayName = c.name.toUpperCase();
            if (pack.courseNameSearch) {
                var searchTerm = pack.courseNameSearch.toUpperCase();
                c.displayName = c.displayName.replace(searchTerm,
                        "<span class='course-name-highlight'>"
                        + searchTerm
                        + "</span>");
            }
        });

        if (done) {
            done(pack.list);
        }
    });
}

function listLesson(pack, error) {
    pack.canLookAfter = false;
    $.ajax({
        url: ServerAddress + "listLesson",
        data: {
            pageNumber: pack.page,
            pageSize: pack.pageSize
        }
    }).done(function (res) {
        if (res.errorMessage) {
            if (error) {
                error(res.errorMessage);
            }
            return;
        }
        if (res.result.length === 0) {
            pack.list = null;
            return;
        }
        if (res.result.length > pack.pageSize) {
            pack.canLookAfter = true;
            res.result.pop();
        }
        pack.list = res.result;
    });
}

function checkItemAttachmentType(item, type) {
    var found = false;
    if (item.items) {//multiple correct answer item
        item.items.forEach(function (item) {
            if (found) {
                return;
            }
            if (item.attach) {
                item.attach.forEach(function (attach) {
                    if (found) {
                        return;
                    }
                    if (attach.type === type) {
                        found = true;
                    }
                });
            }
        });
    } else {
        if (item.attach) {
            item.attach.forEach(function (attach) {
                if (found) {
                    return;
                }
                if (attach.type === type) {
                    found = true;
                }
            });
        }
    }
    return found;
}

function gatherSoundOut(item) {
    var found = false;
    var uri = [];
    if (item.items) {//multiple correct answer item
        item.items.forEach(function (item) {
            if (item.attach) {
                item.attach.forEach(function (attach) {
                    if (attach.type === "sound-out") {
                        found = true;
                        if (attach.uri) {
                            uri.push(attach.uri);
                        }
                    }
                });
            }
        });
    } else {
        if (item.attach) {
            item.attach.forEach(function (attach) {
                if (attach.type === "sound-out") {
                    found = true;
                    if (attach.uri) {
                        uri.push(attach.uri);
                    }
                }
            });
        }
    }
    if (found) {
        item.hasSoundOut = true;
        item.soundUris = uri;
    }
}

function checkLesson(steps) {
    for (var i = 0; i < steps.length; i++) {
        if (!steps[i].check) {
            return false;
        }
    }
    return true;
}

function screenChange() {
    var cw = document.documentElement.clientWidth,
            width = 0,
            sw = window.screen.width,
            sh = window.screen.height;
    //在某些机型（如华为P9）下出现 srceen.width/height 值交换，所以进行大小值比较判断
    width = sw < sh ? sw : sh;
    if (cw <= width) {
        $("body").removeClass("screen");
    }
    if (cw > width) {
        $("body").addClass("screen");
    }
}

function getChannelBuffers(event) {
    var buffers = [];
    for (var ch = 0; ch < 2; ch++) {
        buffers[ch] = event.inputBuffer.getChannelData(ch);
    }
    return buffers;
}

function jsonToOWML(json) {
    var out = "", outAns = "";
    json.steps.forEach(function (step) {
        out += "=" + "fb" + "\r\n";
        step.lines.forEach(function (line) {
            out += "*";
            line.forEach(function (item) {
                if (item.items) {
                    out += "[]";
                    outAns += "#";
                    item.items.forEach(function (item) {
                        outAns += "[" + item.text + "]";
                        if (item.attach) {
                            item.attach.forEach(function (attach) {
                                if (attach.type === "type-in") {
                                    outAns += "(type-in)";
                                }
                                if (attach.type === "sound-out") {
                                    if (attach.uri) {
                                        outAns += "(sound-out:" + attach.uri + ")";
                                    } else {
                                        outAns += "(sound-out)";
                                    }
                                }
                            });
                        }
                    });
                    outAns += "\r\n";
                } else {
                    if (item.type === "pro") {
                        out += "[" + item.text + "]";
                        if (item.attach) {
                            item.attach.forEach(function (attach) {
                                if (attach.type === "type-in") {
                                    out += "(type-in)";
                                }
                                if (attach.type === "sound-out") {
                                    if (attach.uri) {
                                        out += "(sound-out:" + attach.uri + ")";
                                    } else {
                                        out += "(sound-out)";
                                    }
                                }
                                if (attach.type === "sound-in") {
                                    out += "(sound-in)";
                                }
                            });
                        }
                    }
                    if (item.type === "ans") {
                        out += "[]";
                        outAns += "#[" + item.text + "]";
                        if (item.attach) {
                            item.attach.forEach(function (attach) {
                                if (attach.type === "type-in") {
                                    outAns += "(type-in)";
                                }
                                if (attach.type === "sound-out") {
                                    if (attach.uri) {
                                        outAns += "(sound-out:" + attach.uri + ")";
                                    } else {
                                        outAns += "(sound-out)";
                                    }
                                }
                                if (attach.type === "sound-in") {
                                    outAns += "(sound-in)";
                                }
                            });
                        }
                        outAns += "\r\n";
                    }
                }
            });
            out += "\r\n";
        });
        outAns;
        out += outAns;
        outAns = "";

        if (step.marplots.length) {
            out += "%";
        }
        step.marplots.forEach(function (item) {
            if (item.items) {
                item.items.forEach(function (item) {
                    if (item.type === "mar") {
                        out += "[" + item.text + "]";
                    }
                    if (item.attach) {
                        item.attach.forEach(function (attach) {
                            if (attach.type === "sound-out") {
                                if (attach.uri) {
                                    out += "(sound-out:" + attach.uri + ")";
                                } else {
                                    out += "(sound-out)";
                                }
                            }
                        });
                    }
                });
            } else {
                if (item.type === "mar") {
                    out += "[" + item.text + "]";
                }
                if (item.attach) {
                    item.attach.forEach(function (attach) {
                        if (attach.type === "sound-out") {
                            if (attach.uri) {
                                out += "(sound-out:" + attach.uri + ")";
                            } else {
                                out += "(sound-out)";
                            }
                        }
                    });
                }
            }
        });

        out += "\r\n\r\n\r\n";

    });
    return out;
//    var blob = new Blob([out], {type: "text/plain;charset=utf-8"});
//    saveAs(blob, "your_lesson.txt");
}

function hideVirtualKeyboard() {
    if (document.activeElement &&
            document.activeElement.blur &&
            typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
    }
}