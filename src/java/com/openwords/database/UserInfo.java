package com.openwords.database;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import org.hibernate.Session;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;

@Entity
@Table(name = "user_info")
public class UserInfo implements Serializable {

    private static final long serialVersionUID = 1L;

    public static boolean checkUserId(Session s, long id) {
        int exist = ((Number) s.createCriteria(UserInfo.class)
                .add(Restrictions.eq("userId", id))
                .setProjection(Projections.rowCount()
                ).uniqueResult()).intValue();

        return exist <= 0;
    }

    public static boolean checkUserName(Session s, String username) {
        int exist = ((Number) s.createCriteria(UserInfo.class)
                .add(Restrictions.eq("username", username))
                .setProjection(Projections.rowCount()
                ).uniqueResult()).intValue();

        return exist <= 0;
    }

    public static boolean checkEmail(Session s, String email) {
        int exist = ((Number) s.createCriteria(UserInfo.class)
                .add(Restrictions.eq("email", email))
                .setProjection(Projections.rowCount()
                ).uniqueResult()).intValue();

        return exist <= 0;
    }

    @SuppressWarnings("unchecked")
    public static UserInfo loginUser(Session s, String username, String password) {
        List<UserInfo> users = s.createCriteria(UserInfo.class)
                .add(Restrictions.eq("username", username))
                .add(Restrictions.eq("password", password)).list();

        if (users.isEmpty()) {
            users = s.createCriteria(UserInfo.class)
                    .add(Restrictions.eq("email", username))
                    .add(Restrictions.eq("password", password)).list();
            if (users.isEmpty()) {
                return null;
            }
        }
        UserInfo user = users.get(0);
        user.setLastLogin(new Date());
        s.beginTransaction().commit();
        return user;
    }

    public synchronized static void addUser(Session s, UserInfo user) {
        s.save(user);
        s.beginTransaction().commit();
    }

    private long userId;
    private String username, email, password, lastLocation;
    private Date lastLogin;

    public UserInfo() {
    }

    public UserInfo(String username, String email, String password, String lastLocation, Date lastLogin) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.lastLocation = lastLocation;
        this.lastLogin = lastLogin;
    }

    @Id
    @GeneratedValue
    @Column(name = "user_id")
    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    @Column(name = "user_name")
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Column(name = "email")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Column(name = "password")
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Column(name = "last_location")
    public String getLastLocation() {
        return lastLocation;
    }

    public void setLastLocation(String lastLocation) {
        this.lastLocation = lastLocation;
    }

    @Column(name = "last_login")
    @Temporal(javax.persistence.TemporalType.TIMESTAMP)
    public Date getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(Date lastLogin) {
        this.lastLogin = lastLogin;
    }

}
