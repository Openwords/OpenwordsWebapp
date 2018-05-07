package com.openwords.actions.account;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyContextListener;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;

@ParentPackage("json-default")
public class Debug extends MyAction {

    private static final long serialVersionUID = 1L;
    private String context, contextExternal;

    @Action(value = "/debug", results = {
        @Result(name = SUCCESS, type = "json")
    })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        context = MyContextListener.getContextPath(false);
        contextExternal = MyContextListener.getContextPath(true);
        return SUCCESS;
    }

    public String getContext() {
        return context;
    }

    public String getContextExternal() {
        return contextExternal;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
