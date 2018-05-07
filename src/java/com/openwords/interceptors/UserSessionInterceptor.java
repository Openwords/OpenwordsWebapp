package com.openwords.interceptors;

import com.opensymphony.xwork2.Action;
import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.interceptor.Interceptor;
import com.openwords.interfaces.MyAction;
import com.openwords.interfaces.MyActionChecker;
import java.util.Map;

public class UserSessionInterceptor implements Interceptor {

    private static final long serialVersionUID = 1L;

    @Override
    public void destroy() {
    }

    @Override
    public void init() {
    }

    @Override
    public String intercept(ActionInvocation ai) throws Exception {
        if (ai.getAction() instanceof MyActionChecker) {
            MyActionChecker action = (MyActionChecker) ai.getAction();

            Map<String, Object> session = ai.getInvocationContext().getSession();
            System.out.println("UserSessionInterceptor: " + session);
            if (!session.containsKey(MyAction.SessionKey_UserSession)) {
                return Action.LOGIN;
            }
            long userId = (long) session.get(MyAction.SessionKey_UserSession);
            action.setUserId(userId);
        }
        return ai.invoke();
    }

}
