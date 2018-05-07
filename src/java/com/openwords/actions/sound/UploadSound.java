package com.openwords.actions.sound;

import static com.opensymphony.xwork2.Action.LOGIN;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.Sound;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyContextListener;
import com.openwords.utils.UtilLog;
import java.io.File;
import org.apache.commons.io.FileUtils;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;

@ParentPackage("my-package")
public class UploadSound extends MyAction {

    private static final long serialVersionUID = 1L;
    private File file;
    private String text, type;

    @Action(value = "/uploadSound",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = LOGIN, location = "sendHttpError", type = "redirect")
            })
    @Override
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/uploadSound: " + " " + type + " " + text);
        if (file == null) {
            sendBadRequest("Need actual file");
            return null;
        }
        if (text == null) {
            sendBadRequest("Need text");
            return null;
        }
        if (type == null) {
            sendBadRequest("Need type");
            return null;
        }

        Session s = DatabaseHandler.getSession();
        try {
            long now = System.currentTimeMillis();

            String fileName = now + "." + type;
            String path = MyContextListener.getContextPath(true) + "data_sound/" + getUserId() + "/" + fileName;
            FileUtils.copyFile(file, new File(path));
            Sound sound = new Sound(getUserId(), now, text, "", fileName);
            s.save(sound);
            s.beginTransaction().commit();

            getHttpResponse().getWriter().println(getUserId() + "/" + fileName);

        } catch (Exception e) {
            UtilLog.logError(this, e);
            sendError(e.toString());
        } finally {
            s.close();
        }
        return null;
    }

    public void setFile(File file) {
        this.file = file;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }

}
