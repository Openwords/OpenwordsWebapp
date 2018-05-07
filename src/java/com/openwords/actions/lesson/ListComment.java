package com.openwords.actions.lesson;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.Comment;
import com.openwords.database.DatabaseHandler;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.UtilLog;
import java.util.List;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;

@ParentPackage("my-package")
public class ListComment extends MyAction {

    private static final long serialVersionUID = 1L;
    private String errorMessage, lessonName;
    private long authorId;
    private List<Comment> result;

    @Action(value = "/listComment",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        Session s = DatabaseHandler.getSession();
        try {
            String sql = "SELECT * FROM comment\n"
                    + "where JSON_EXTRACT(content, '$.name')='@lessonName@'\n".replace("@lessonName@", lessonName)
                    + "and JSON_EXTRACT(content, '$.userId')=@authorId@\n".replace("@authorId@", String.valueOf(authorId))
                    + "order by make_time desc\n"
                    + "limit 50 OFFSET 0";
            result = s.createSQLQuery(sql).addEntity(Comment.class).list();

        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setLessonName(String lessonName) {
        this.lessonName = lessonName;
    }

    public void setAuthorId(long authorId) {
        this.authorId = authorId;
    }

    public List<Comment> getResult() {
        return result;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
