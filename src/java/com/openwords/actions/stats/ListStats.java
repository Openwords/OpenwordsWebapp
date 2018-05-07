package com.openwords.actions.stats;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.Stats;
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
public class ListStats extends MyAction {

    private static final long serialVersionUID = 1L;
    private List<Stats> result;
    private String errorMessage, type;

    @Action(value = "/listStats",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/listStats: " + type);
        Session s = DatabaseHandler.getSession();
        try {
//            if(type.equals(RecordStats.Stats_Type_Course)){
//            }
            result = s.createCriteria(Stats.class)
                    .add(Restrictions.eq("userId", getUserId()))
                    .add(Restrictions.eq("objectType", type))
                    .addOrder(Order.desc("updated")).list();
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<Stats> getResult() {
        return result;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
