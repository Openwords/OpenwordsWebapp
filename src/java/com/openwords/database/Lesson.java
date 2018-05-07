package com.openwords.database;

import com.openwords.utils.MyGson;
import java.io.Serializable;
import java.util.List;
import java.util.Map;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import org.apache.struts2.json.annotations.JSON;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@Entity
@Table(name = "lessons")
public class Lesson implements Serializable {

    private static final long serialVersionUID = 1L;

    public static Lesson getLesson(Session s, long userId, String name) {
        @SuppressWarnings("unchecked")
        List<Lesson> r = s.createCriteria(Lesson.class)
                .add(Restrictions.eq("userId", userId))
                .add(Restrictions.eq("name", name))
                .list();
        if (r.isEmpty()) {
            return null;
        }
        return r.get(0);
    }
    private long userId, updated;
    private String name, content, langOne, langTwo;
    private Map<String, Object> json;
    private boolean imf;

    public Lesson() {
    }

    public Lesson(long userId, String name, String langOne, String langTwo, long updated) {
        this.userId = userId;
        this.updated = updated;
        this.name = name;
        this.langOne = langOne;
        this.langTwo = langTwo;
    }

    @Id
    @Column(name = "user_id")
    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    @Id
    @Column(name = "lesson_name")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Column(name = "language_one")
    public String getLangOne() {
        return langOne;
    }

    public void setLangOne(String langOne) {
        this.langOne = langOne;
    }

    @Column(name = "language_two")
    public String getLangTwo() {
        return langTwo;
    }

    public void setLangTwo(String langTwo) {
        this.langTwo = langTwo;
    }

    @Column(name = "content")
    @JSON(serialize = false, deserialize = false)
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Column(name = "updated_time")
    public long getUpdated() {
        return updated;
    }

    public void setUpdated(long updated) {
        this.updated = updated;
    }

    @Column(name = "imf")
    public boolean isImf() {
        return imf;
    }

    public void setImf(boolean imf) {
        this.imf = imf;
    }

    @Transient
    public Map<String, Object> getJson() {
        if (json == null) {
            json = MyGson.fromJson(content, Map.class);
        }
        return json;
    }

}
