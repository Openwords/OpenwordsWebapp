package com.openwords.actions.account;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.UtilLog;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;

@ParentPackage("my-package")
public class LogoutUser extends MyAction {

    private static final long serialVersionUID = 1L;
    private String errorMessage;

    @Action(value = "/logoutUser",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
        @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/logoutUser");
        try {
            getHttpSession().clear();
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        }
        return SUCCESS;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
