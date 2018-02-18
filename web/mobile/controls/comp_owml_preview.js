function defineCompOwmlPreview() {
    Vue.component("comp-owml-preview", {
        template: "#comp_owml_preview",
        props: ["owml"],
        methods: {
            downloadOWML: function () {
                var blob = new Blob([this.owml], {type: "text/plain;charset=utf-8"});
                saveAs(blob, "your_lesson.txt");
            }
        }
    });
}