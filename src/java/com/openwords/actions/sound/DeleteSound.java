package com.openwords.actions.sound;

import static com.opensymphony.xwork2.Action.SUCCESS;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.Sound;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyContextListener;
import com.openwords.utils.UtilLog;
import java.io.File;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@ParentPackage("my-package")
public class DeleteSound extends MyAction {

    private static final long serialVersionUID = 1L;
    private String errorMessage;
    private long time;

    @Action(value = "/deleteSound",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = SUCCESS, type = "json")
                ,
                @Result(name = LOGIN, location = "error1.json", type = "redirect")
            })
    @Override
    @SuppressWarnings("unchecked")
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/deleteSound");
        Session s = DatabaseHandler.getSession();
        try {
            Sound sound = (Sound) s.createCriteria(Sound.class)
                    .add(Restrictions.eq("updated", time))
                    .add(Restrictions.eq("userId", getUserId()))
                    .list().get(0);
            s.delete(sound);
            s.beginTransaction().commit();

            try {
                String path = MyContextListener.getContextPath(true) + "data_sound/" + sound.getUserId() + "/" + sound.getFile();
                File file = new File(path);
                file.delete();
            } catch (Exception e) {
                UtilLog.logWarn(this, e);
            }

        } catch (Exception e) {
            errorMessage = e.toString();
            UtilLog.logWarn(this, errorMessage);
        } finally {
            s.close();
        }
        return SUCCESS;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
