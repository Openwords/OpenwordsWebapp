package com.openwords.actions.course;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.Course;
import com.openwords.database.DatabaseHandler;
import com.openwords.functions.RecordStats;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.UtilLog;
import java.util.List;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class CopyCourse extends MyAction {

    private static final long serialVersionUID = 1L;
    private Course result;
    private String errorMessage;
    private long authorId, makeTime;
    private boolean canSync;

    @Action(value = "/copyCourse",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, String.format("/copyCourse\n"
                + "makeTime: %s\n"
                + "authorId: %s\n"
                + "userId: %s\n", makeTime, authorId, getUserId()));
        Session s = DatabaseHandler.getSession();
        try {
            if (getUserId() <= 0) {
                throw new Exception("userId not valid");
            }
            List<Course> record = s.createCriteria(Course.class)
                    .add(Restrictions.eq("userId", getUserId()))
                    .add(Restrictions.eq("authorId", authorId))
                    .add(Restrictions.eq("makeTime", makeTime)).list();

            if (record.isEmpty()) {
                result = (Course) s.createCriteria(Course.class)
                        .add(Restrictions.eq("userId", 0l))
                        .add(Restrictions.eq("authorId", authorId))
                        .add(Restrictions.eq("makeTime", makeTime))
                        .list().get(0);

                s.evict(result);
                result.setUserId(getUserId());
                s.save(result);
                s.beginTransaction().commit();

                RecordStats.courseNewLearner(s, result);
            } else {
                result = record.get(0);

                try {
                    String sql = "SELECT updated_time FROM courses\n"
                            + "where user_id=@userId@ and\n"
                            + "author_id=@authorId@ and\n"
                            + "make_time=@makeTime@\n";
                    sql = sql.replace("@userId@", "0")
                            .replace("@authorId@", String.valueOf(authorId))
                            .replace("@makeTime@", String.valueOf(makeTime));

                    Number original = (Number) s.createSQLQuery(sql).list().get(0);
                    if (result.getUpdated() < original.longValue()) {
                        canSync = true;
                    }
                } catch (Exception e) {
                    UtilLog.logWarn(this, e);
                    UtilLog.logWarn(this, "No way to sync course");
                }
            }

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

    public boolean isCanSync() {
        return canSync;
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
