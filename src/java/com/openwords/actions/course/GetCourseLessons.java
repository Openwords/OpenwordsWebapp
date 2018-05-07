package com.openwords.actions.course;

import com.google.gson.reflect.TypeToken;
import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.Lesson;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyGson;
import com.openwords.utils.UtilLog;
import java.util.List;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;

@ParentPackage("my-package")
public class GetCourseLessons extends MyAction {

    private static final long serialVersionUID = 1L;
    private List<Lesson> result;
    private String errorMessage;
    private long makeTime;

    @Action(value = "/getCourseLessons",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/getCourseLessons");
        Session s = DatabaseHandler.getSession();
        try {
            String sql = "SELECT JSON_EXTRACT(content, '$.lessons') as lessons\n"
                    + "FROM courses\n"
                    + "where user_id=@userId@ and\n"
                    + "author_id=@authorId@ and\n"
                    + "make_time=@makeTime@\n";
            sql = sql.replace("@userId@", String.valueOf(0l))
                    .replace("@authorId@", String.valueOf(getUserId()))
                    .replace("@makeTime@", String.valueOf(makeTime));

            String lessons = (String) s.createSQLQuery(sql).list().get(0);
            result = MyGson.fromJson(lessons, new TypeToken<List<Lesson>>() {
            }.getType());

        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setMakeTime(long makeTime) {
        this.makeTime = makeTime;
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
