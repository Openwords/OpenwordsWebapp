package com.openwords.actions.lesson;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.Lesson;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.UtilLog;
import java.util.List;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class ListLesson extends MyAction {

    private static final long serialVersionUID = 1L;
    private List<Lesson> result;
    private String errorMessage;
    private int pageNumber = 1, pageSize = 7;

    @Action(value = "/listLesson",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/listLesson: " + getUserId());
        Session s = DatabaseHandler.getSession();
        try {
            int firstRecord = (pageNumber - 1) * pageSize;
            Criteria c = s.createCriteria(Lesson.class)
                    .add(Restrictions.eq("userId", getUserId()))
                    .setFirstResult(firstRecord)
                    .setMaxResults(pageSize + 1)
                    .addOrder(Order.desc("updated"));

            result = c.list();
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public List<Lesson> getResult() {
        return result;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
