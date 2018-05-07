package com.openwords.actions.course;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.Course;
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
public class GetMyProgress extends MyAction {

    private static final long serialVersionUID = 1L;
    private List<Course> result;
    private String errorMessage;
    private boolean recent;

    @Action(value = "/getMyProgress",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/getMyProgress");
        Session s = DatabaseHandler.getSession();
        try {
            if (recent) {
                String sql = "SELECT * FROM courses\n"
                        + "where JSON_EXTRACT(content, '$.learnTime')>0\n"
                        + "and user_id=@userId@\n"
                        + "order by JSON_EXTRACT(content, '$.learnTime') desc\n"
                        + "limit 1 OFFSET 0";
                sql = sql.replace("@userId@", String.valueOf(getUserId()));

                result = s.createSQLQuery(sql).addEntity(Course.class).list();
            }

        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setRecent(boolean recent) {
        this.recent = recent;
    }

    public List<Course> getResult() {
        return result;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
