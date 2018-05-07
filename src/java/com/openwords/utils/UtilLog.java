package com.openwords.utils;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 *
 * @author hanaldo
 */
public class UtilLog {

    private static final Log log = LogFactory.getLog(UtilLog.class);

    public static void logInfo(Object c, Object message) {
        log.info(getClassName(c) + ":: " + message.toString());
    }

    public static void logWarn(Object c, Object message) {
        log.warn(getClassName(c) + ":: " + message.toString());
    }

    public static void logError(Object c, Object message) {
        log.error(getClassName(c) + ":: " + message.toString());
    }

    private static String getClassName(Object o) {
        if (o instanceof Class) {
            return o.toString();
        } else {
            return o.getClass().getName();
        }
    }

    private UtilLog() {
    }
}
