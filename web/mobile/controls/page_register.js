function defineRegisterPage() {
    var required = window.validators.required;
    var minLength = window.validators.minLength;
    var sameAs = window.validators.sameAs;
    var email = window.validators.email;
    const touchMap = new WeakMap();

    Vue.component("page-register", {
        template: "#page_register",
        data() {
            return {
                myform: {},
                model: {
                    regUsername: '',
                    regPass: '',
                    regRepass: '',
                    regEmail: ''
                }
            };
        },
        validations: {
            model: {
                regUsername: {
                    required: required,
                    minLength: minLength(3)
                },
                regPass: {
                    required: required,
                    minLength: minLength(6)
                },
                regRepass: {
                    sameAsPassword: sameAs('regPass')
                },
                regEmail: {
                    required: required,
                    email
                }
            },
            validationGroup: ['model.regUsername', 'model.regPass', 'model.regRepass', 'model.regEmail']
        },
        methods: {
            myInput: function ($v) {
                $v.$reset();
                if (touchMap.has($v)) {
                    clearTimeout(touchMap.get($v));
                }
                touchMap.set($v, setTimeout($v.$touch, 500));
            },
            submitOk: function () {
                var self = this;
                var regOk = false;
                self.$f7.showPreloader(self.$t("wait"));
                setTimeout(function () {
                    self.$f7.hidePreloader();
                    if (!regOk) {
                        self.$f7.alert(self.$t("server-error"), self.$t("error"));
                    }
                }, 15000);
                var params = {
                    username: this.model.regUsername,
                    password: this.model.regPass,
                    email: this.model.regEmail
                };
                $.get(ServerAddress + "addUser", params, function (res) {
                    regOk = true;
                    self.$f7.hidePreloader();
                    if (!res.errorMessage) {
                        self.$f7.alert(null, self.$t("account-created"));
                        self.$router.back();
                    } else {
                        self.$f7.alert(self.$t("registration-fail-message"), self.$t("registration-fail"));
                    }
                });
            }
        }
    });
}

