package com.openwords.utils;

import com.openwords.database.DatabaseHandler;
import java.text.SimpleDateFormat;
import java.util.TimeZone;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 *
 * @author hanaldo
 */
public class MyContextListener implements ServletContextListener {

    private static String contextPath;
    private static final String cloudContextPath = "/my_web_data/";
    public static final SimpleDateFormat httpDateFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z");

    public static String getContextPath(boolean useExternal) {
        if (useExternal) {
            return cloudContextPath;//本地开发时需把这里临时改为contextPath
        } else {
            return contextPath;
        }
    }

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        contextPath = sce.getServletContext().getRealPath("/");
        if (!contextPath.endsWith("/")) {
            contextPath += "/";
        }
        UtilLog.logInfo(this, "Servlet Context Path: " + contextPath);

        DatabaseHandler.getSession().close();
        UtilLog.logInfo(this, "contextInitialized");
        httpDateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        DatabaseHandler.cleanIt();
        UtilLog.logInfo(this, "contextDestroyed");
    }
}
