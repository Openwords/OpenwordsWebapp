package com.openwords.actions.course;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.Course;
import com.openwords.database.DatabaseHandler;
import com.openwords.functions.RecordStats;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyGson;
import com.openwords.utils.UtilLog;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class SaveCourseProgress extends MyAction {
    
    private static final long serialVersionUID = 1L;
    private String course, errorMessage;
    
    @Action(value = "/saveCourseProgress",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    public String execute() throws Exception {
        Session s = DatabaseHandler.getSession();
        try {
            Course c = MyGson.fromJson(course, Course.class);
            UtilLog.logInfo(this, String.format("/saveCourseProgress\n"
                    + "courseName: %s\n"
                    + "userId: %s\n", c.getName(), getUserId()));
            if (getUserId() <= 0) {
                throw new Exception("UserId invalid");
            }
            
            Course old = (Course) s.createCriteria(Course.class)
                    .add(Restrictions.eq("makeTime", c.getMakeTime()))
                    .add(Restrictions.eq("authorId", c.getAuthorId()))
                    .add(Restrictions.eq("userId", getUserId()))
                    .list().get(0);
            old.setContent(c.getContent());
            
            s.beginTransaction().commit();
            
            RecordStats.recomputeCourseStats(s, old);
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }
    
    public void setCourse(String course) {
        this.course = course;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
