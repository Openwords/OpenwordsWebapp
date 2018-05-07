package com.openwords.actions.sound;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.Sound;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.UtilLog;
import java.util.List;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class ListSound extends MyAction {

    private static final long serialVersionUID = 1L;
    private List<Sound> result;
    private String errorMessage;
    private int pageNumber = 1, pageSize = 5;

    @Action(value = "/listSound",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/listSound");
        Session s = DatabaseHandler.getSession();
        try {
            result = s.createCriteria(Sound.class)
                    .add(Restrictions.eq("userId", getUserId()))
                    .addOrder(Order.desc("updated"))
                    .list();
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public List<Sound> getResult() {
        return result;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
