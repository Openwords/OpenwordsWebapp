package com.openwords.actions.sound;

import com.openwords.database.DatabaseHandler;
import com.openwords.interfaces.MyAction;
import com.openwords.utils.MyContextListener;
import com.openwords.utils.UtilLog;
import java.io.File;
import org.apache.commons.io.FileUtils;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.hibernate.Session;

@ParentPackage("json-default")
public class GetSound extends MyAction {

    private static final long serialVersionUID = 1L;
    private String fileName, userId;

    @Action(value = "/getSound")
    @Override
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/getSound " + fileName);
        Session s = DatabaseHandler.getSession();
        try {
            String path = MyContextListener.getContextPath(true) + "data_sound/" + userId + "/" + fileName;
            File file = new File(path);
            getHttpResponse().setHeader("Content-Type", "audio/mpeg");
            getHttpResponse().setHeader("Content-Length", String.valueOf(file.length()));
            getHttpResponse().setHeader("Last-Modified", MyContextListener.httpDateFormat.format(file.lastModified()));
            FileUtils.copyFile(file, getHttpResponse().getOutputStream());
        } catch (Exception e) {
            UtilLog.logWarn(this, e);
            sendBadRequest(e.toString());
        } finally {
            DatabaseHandler.closeSession(s);
        }
        return null;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }
}
