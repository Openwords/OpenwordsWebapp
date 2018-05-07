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
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class ListCourse extends MyAction {

    private static final long serialVersionUID = 1L;
    private List<Course> result;
    private String errorMessage, courseNameSearch;
    private int pageNumber = 1, pageSize = 5;
    private long authorId;
    private boolean all,//all public courses
            user,//courses I have learned
            my;//courses I made

    @Action(value = "/listCourse",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, String.format("/listCourse\n"
                + "authorId: %s\n"
                + "user: %s\n"
                + "my: %s\n"
                + "all: %s\n"
                + "courseNameSearch: %s\n", authorId, user, my, all, courseNameSearch));
        Session s = DatabaseHandler.getSession();
        try {
            if (my) {
                authorId = getUserId();
                setUserId(-1);
            } else if (!user) {
                setUserId(-1);
            }

            int firstRecord = (pageNumber - 1) * pageSize;

            if (all) {
                String sql = "SELECT * FROM courses\n"
                        + "where JSON_LENGTH(content, '$.lessons')>0\n";
                if (courseNameSearch != null) {
                    sql += "and course_name like '%@course_name@%'\n".replace("@course_name@", courseNameSearch);
                }
                sql += "and user_id=0\n"
                        + "order by make_time desc\n"
                        + "limit @pageSize@ OFFSET @firstRecord@"
                                .replace("@pageSize@", String.valueOf(pageSize + 1))
                                .replace("@firstRecord@", String.valueOf(firstRecord));
                result = s.createSQLQuery(sql).addEntity(Course.class).list();
            } else {
                Criteria c = s.createCriteria(Course.class)
                        .setFirstResult(firstRecord)
                        .setMaxResults(pageSize + 1)
                        .addOrder(Order.desc("makeTime"));

                if (getUserId() > 0) {
                    c.add(Restrictions.eq("userId", getUserId()));
                } else if (authorId > 0) {
                    c.add(Restrictions.eq("authorId", authorId));
                    c.add(Restrictions.eq("userId", 0l));
                } else {
                    throw new Exception("Invalid parameters");
                }
                result = c.list();
            }
            for (Course c : result) {
                c.getJson().remove("lessons");
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

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
        if (this.pageSize > 50) {
            this.pageSize = 50;
        }
    }

    public void setUser(boolean user) {
        this.user = user;
    }

    public void setAll(boolean all) {
        this.all = all;
    }

    public void setMy(boolean my) {
        this.my = my;
    }

    public List<Course> getResult() {
        return result;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setCourseNameSearch(String courseNameSearch) {
        this.courseNameSearch = courseNameSearch;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
