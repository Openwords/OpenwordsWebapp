package com.openwords.actions.lesson;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.Lesson;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.UtilLog;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class UpdateLessonContent extends MyAction {

    private static final long serialVersionUID = 1L;
    private String name, content, errorMessage;

    @Action(value = "/updateLessonContent",
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
            UtilLog.logInfo(this, "/updateLessonContent: " + name);

            Lesson old = (Lesson) s.createCriteria(Lesson.class)
                    .add(Restrictions.eq("userId", getUserId()))
                    .add(Restrictions.eq("name", name))
                    .list().get(0);
            old.setContent(content);
            old.setUpdated(System.currentTimeMillis());
            s.beginTransaction().commit();
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
