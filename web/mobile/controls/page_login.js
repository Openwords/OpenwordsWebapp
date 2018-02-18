function defineLoginPage() {
    Vue.component("page-login", {
        template: "#page_login",
        data() {
            return{
                username: "",
                password: ""
            };
        },
        created() {
            var self = this;
            var lang, langs;
            if (navigator.languages && navigator.languages.length) {
                langs = navigator.languages;
            } else if (navigator.userLanguage) {
                lang = navigator.userLanguage;
            } else {
                lang = navigator.language;
            }
            console.log(langs);
            if (!langs.length) {
                langs = [lang];
            }
            var found = false;
            langs.forEach(function (code) {
                if (found) {
                    return;
                }
                supportedLanguages.forEach(function (support) {
                    if (found) {
                        return;
                    }
                    if (code.toLowerCase() === support.code) {
                        found = true;
                        if (support.code === "en") {
                            return;
                        }
                        self.$store.commit("setCurrentLanguage", support);
                        $.getJSON("static_data/translations/" + support.code + ".json")
                                .done(function (res) {
                                    self.$i18n.add(support.code, res);
                                    self.$i18n.set(support.code);
                                    self.$f7.params.modalButtonCancel = self.$t("cancel");
                                    self.$f7.params.modalButtonOk = self.$t("ok");
                                });
                        moment.locale(support.code);
                    }
                });
            });
        },
        computed: {
            currentLanguage() {
                return this.$store.state.currentLanguage;
            },
            languages() {
                return supportedLanguages;
            }
        },
        methods: {
            languageChange(language) {
                var self = this;
                self.$store.commit("setCurrentLanguage", language);
                if (language.code === "en") {
                    self.$i18n.set("en");
                    self.$f7.params.modalButtonCancel = self.$t("cancel");
                    self.$f7.params.modalButtonOk = self.$t("ok");
                } else if (self.$i18n.localeExists(language.code)) {
                    self.$i18n.set(language.code);
                    self.$f7.params.modalButtonCancel = self.$t("cancel");
                    self.$f7.params.modalButtonOk = self.$t("ok");
                } else {
                    self.$f7.showPreloader(self.$t("waiting-language"));
                    $.getJSON("static_data/translations/" + language.code + ".json")
                            .done(function (res) {
                                self.$i18n.add(language.code, res);
                                self.$i18n.set(language.code);
                                self.$f7.params.modalButtonCancel = self.$t("cancel");
                                self.$f7.params.modalButtonOk = self.$t("ok");
                                self.$f7.hidePreloader();
                            })
                            .fail(function () {
                                self.$f7.hidePreloader();
                                self.$f7.alert(null, "No language data");
                            });
                }
                moment.locale(language.code);
            },
            doLogin() {
                hideVirtualKeyboard();
                var self = this;
                console.log("this.$router: " + this.$router);
                self.$f7.showPreloader(self.$t("connect"));
                var params = {
                    username: this.username,
                    password: this.password
                };
                self.$store.commit("setUserInfo", {username: this.username});
                var loginTime = setTimeout(function () {
                    self.$f7.hidePreloader();
                    self.$f7.alert(self.$t("server-error"), self.$t("error"));
                }, 10000);
                $.get(ServerAddress + "loginUser", params, function (res) {
                    clearTimeout(loginTime);
                    self.$f7.hidePreloader();
                    if (!res.errorMessage) {
                        self.$f7.views.main.router.load({url: "/home/"});
                        self.$f7.alert(self.$t("notice-message"), self.$t("notice"));
                    } else {
                        self.$f7.alert(self.$t("login-fail-message"), self.$t("login-fail"));
                    }
                });
            },
            doRegister() {
                this.$f7.views.main.router.load({url: "/register/"});
            }
        },
        destroyed() {
            console.log("page-login destroyed");
        }
    });
}