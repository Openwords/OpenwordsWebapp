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
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class SyncCourse extends MyAction {

    private static final long serialVersionUID = 1L;
    private Course result;
    private String errorMessage;
    private long authorId, makeTime;

    @Action(value = "/syncCourse",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, String.format("/syncCourse\n"
                + "makeTime: %s\n"
                + "authorId: %s\n", makeTime, authorId));
        Session s = DatabaseHandler.getSession();
        try {
            Course learning = (Course) s.createCriteria(Course.class)
                    .add(Restrictions.eq("userId", getUserId()))
                    .add(Restrictions.eq("authorId", authorId))
                    .add(Restrictions.eq("makeTime", makeTime)).list().get(0);

            Course original = (Course) s.createCriteria(Course.class)
                    .add(Restrictions.eq("userId", 0l))
                    .add(Restrictions.eq("authorId", authorId))
                    .add(Restrictions.eq("makeTime", makeTime)).list().get(0);

            if (learning.getUpdated() >= original.getUpdated()) {
                throw new Exception("Original course is not newer");
            }

            learning.setContent(original.getContent());
            learning.setUpdated(original.getUpdated());
            s.beginTransaction().commit();
            result = learning;

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

    public Course getResult() {
        return result;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
