package com.openwords.actions.course;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.Course;
import com.openwords.database.DatabaseHandler;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.UtilLog;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class DeleteCourse extends MyAction {

    private static final long serialVersionUID = 1L;
    private String errorMessage;
    private long authorId, makeTime;

    @Action(value = "/deleteCourse",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, String.format("/deleteCourse\n"
                + "makeTime: %s\n"
                + "authorId: %s\n", makeTime, authorId));
        long studentId = 0l;
        if (authorId > 0) {
            studentId = getUserId();//delete progress
        } else {
            authorId = getUserId();//delete own course
        }
        Session s = DatabaseHandler.getSession();
        try {
            Criteria c = s.createCriteria(Course.class)
                    .add(Restrictions.eq("makeTime", makeTime))
                    .add(Restrictions.eq("authorId", authorId))
                    .add(Restrictions.eq("userId", studentId));
            s.delete(c.list().get(0));
            s.beginTransaction().commit();
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setAuthorId(long authorId) {
        this.authorId = authorId;
    }

    public void setMakeTime(long makeTime) {
        this.makeTime = makeTime;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
