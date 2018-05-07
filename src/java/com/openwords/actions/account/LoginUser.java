package com.openwords.actions.account;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.UserInfo;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyFieldValidation;
import com.openwords.utils.UtilLog;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;

@ParentPackage("json-default")
public class LoginUser extends MyAction {

    private static final long serialVersionUID = 1L;
    private String username, password, errorMessage;

    @Action(value = "/loginUser", results = {
        @Result(name = SUCCESS, type = "json")
        ,
        @Result(name = INPUT, type = "json")
    })
    @Override
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/loginUser");
        Session s = DatabaseHandler.getSession();
        try {
            UserInfo user = UserInfo.loginUser(s, username, password);
            if (user == null) {
                errorMessage = "login fail";
            } else {
                getHttpSession().put(SessionKey_UserSession, user.getUserId());
            }
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            DatabaseHandler.closeSession(s);
        }
        return SUCCESS;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void validate() {
        MyFieldValidation.checkUsernameField(this, username);
        MyFieldValidation.checkPasswordField(this, password);
    }

    @Override
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
