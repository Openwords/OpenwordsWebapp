function defineAudiencePart() {
    Vue.component("part-audience", {
        template: "#part_audience",
        data() {
            return{
                stats: []
            };
        },
        mounted() {
            this.$store.state.allCourseList.page = 1;
            var self = this;
            $.ajax(ServerAddress + "listStats", {
                data: {type: "c"}
            }).done(function (res) {
                if (!res.errorMessage) {
                    res.result.forEach(function (item) {
                        item.lastStudy = moment(item.updated).format("LL");
                        if (item.json.totalLearner && item.json.finshed) {
                            item.per = ((item.json.finshed / item.json.totalLearner) * 100).toFixed(0);
                        } else {
                            item.per = 0;
                        }
                    });
                    self.stats = res.result;
                }
            });
        }
    });
}