package com.openwords.actions.account;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.UserInfo;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyFieldValidation;
import com.openwords.utils.UtilLog;
import java.util.Date;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;

@ParentPackage("json-default")
public class AddUser extends MyAction {

    private static final long serialVersionUID = 1L;
    private boolean result;
    private long userId = -1;
    private String username, password, email, errorMessage;

    @Action(value = "/addUser", results = {
        @Result(name = SUCCESS, type = "json"),
        @Result(name = INPUT, type = "json")
    })
    @Override
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/addUser: " + username);
        Session s = DatabaseHandler.getSession();
        try {
            if (!UserInfo.checkUserName(s, username)) {
                throw new Exception("username is already registered");
            }
            if (!UserInfo.checkEmail(s, email)) {
                throw new Exception("email is already registered");
            }
            UserInfo user = new UserInfo(username, email, password, "", new Date());
            UserInfo.addUser(s, user);
            userId = user.getUserId();
            result = true;
        } catch (Exception e) {
            errorMessage = e.getMessage();
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

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isResult() {
        return result;
    }

    public long getUserId() {
        return userId;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void validate() {
        MyFieldValidation.checkUsernameField(this, username);
        MyFieldValidation.checkPasswordField(this, password);
        MyFieldValidation.checkEmailField(this, email);
    }

    @Override
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
