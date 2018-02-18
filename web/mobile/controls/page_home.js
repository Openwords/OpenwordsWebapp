function defineHomePage() {
    Vue.component("page-home", {
        template: "#page_home",
        data() {
            return {
                parts: [true, false]
            };
        },
        created() {
            this.$store.state.pageInstances.home = this;
        },
        methods: {
            showPart(i) {
                this.parts.forEach(function (item, index, array) {
                    if (i === index) {
                        array.splice(index, 1, true);
                    } else {
                        array.splice(index, 1, false);
                    }
                });
            }
        }
    });
}