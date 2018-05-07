/**
 * Copyright (C) 2013 Shenshen Han
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
package com.openwords.database;

import com.openwords.utils.UtilLog;
import java.util.List;
import java.util.Map;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.cfg.Configuration;
import org.hibernate.transform.AliasToEntityMapResultTransformer;

public class DatabaseHandler {

    private static DatabaseHandler instance;

    private static DatabaseHandler getInstance() {
        if (instance == null) {
            instance = new DatabaseHandler();
        }
        return instance;
    }

    public static List<Map<String, Object>> Query(String sql, Session s) {
        Query q = s.createSQLQuery(sql).setResultTransformer(AliasToEntityMapResultTransformer.INSTANCE);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> r = q.list();
        return r;
    }

    public static Session getSession() {
        return DatabaseHandler.getInstance().getHibernateSession();
    }

    public static void closeSession(Session session) {
        session.close();
    }

    public static void cleanIt() {
        if (instance != null) {
            instance.clean();
        }
    }
    private final SessionFactory sessionFactory;

    private DatabaseHandler() {
        String host = "127.0.0.1";
        String port = "3306";
        String username = "root";
        String password = "han";
        String dbName = "openwordsdb";

        Configuration configuration = new Configuration();
        configuration.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        configuration.setProperty("hibernate.connection.driver_class", "com.mysql.jdbc.Driver");
        configuration.setProperty("hibernate.connection.url", "jdbc:mysql://" + host + ":" + port + "/" + dbName + "?autoReconnect=true");
        configuration.setProperty("hibernate.connection.username", username);
        configuration.setProperty("hibernate.connection.password", password);

        configuration.setProperty("hibernate.connection.characterEncoding", "utf-8");
        //configuration.setProperty("hibernate.format_sql", "true");
        //configuration.setProperty("hibernate.show_sql", "true");
        configuration.setProperty("hibernate.connection.provider_class", "org.hibernate.c3p0.internal.C3P0ConnectionProvider");
        configuration.setProperty("hibernate.c3p0.idleConnectionTestPeriod", "600");
        configuration.setProperty("hibernate.c3p0.testConnectionOnCheckin", "true");

        configuration
                .addAnnotatedClass(UserInfo.class)
                .addAnnotatedClass(Lesson.class)
                .addAnnotatedClass(Course.class)
                .addAnnotatedClass(Sound.class)
                .addAnnotatedClass(Comment.class)
                .addAnnotatedClass(Stats.class);

        sessionFactory = configuration.buildSessionFactory(new StandardServiceRegistryBuilder().applySettings(configuration.getProperties()).build());
        sessionFactory.getStatistics().setStatisticsEnabled(true);

        UtilLog.logInfo(DatabaseHandler.class, "SessionFactory created");
    }

    private synchronized void clean() {
        sessionFactory.close();
        instance = null;
        UtilLog.logInfo(this, "clean DatabaseHandler " + sessionFactory.isClosed());
    }

    private synchronized Session getHibernateSession() {
        Session session = sessionFactory.openSession();
        return session;
    }

}
