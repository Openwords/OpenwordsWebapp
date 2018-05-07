package com.openwords.actions.account;

import com.openwords.interfaces.MyAction;
import org.apache.struts2.convention.annotation.Action;

public class SendHttpError extends MyAction {

    private static final long serialVersionUID = 1L;

    @Action(value = "/sendHttpError")
    @Override
    public String execute() throws Exception {
        sendUnauthorized();
        return null;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }

}
