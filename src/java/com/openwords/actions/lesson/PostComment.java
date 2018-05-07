package com.openwords.actions.lesson;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.Comment;
import com.openwords.database.DatabaseHandler;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyGson;
import com.openwords.utils.UtilLog;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;

@ParentPackage("my-package")
public class PostComment extends MyAction {

    private static final long serialVersionUID = 1L;
    private String comment, errorMessage;

    @Action(value = "/postComment",
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
            Comment c = MyGson.fromJson(comment, Comment.class);
            c.setUserId(getUserId());
            UtilLog.logInfo(this, "/postComment: " + c.getUserId());
            c.setMakeTime(System.currentTimeMillis());
            s.save(c);
            s.beginTransaction().commit();
        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
