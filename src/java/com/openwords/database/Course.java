package com.openwords.database;

import com.openwords.utils.MyGson;
import java.io.Serializable;
import java.util.Map;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import org.apache.struts2.json.annotations.JSON;

@Entity
@Table(name = "courses")
public class Course implements Serializable {

    private static final long serialVersionUID = 1L;

    private long authorId, userId, makeTime, updated;
    private String name, content, fileCover, langOne, langTwo;
    private Map<String, Object> json;

    public Course() {
    }

    @Id
    @Column(name = "author_id")
    public long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(long authorId) {
        this.authorId = authorId;
    }

    @Id
    @Column(name = "make_time")
    public long getMakeTime() {
        return makeTime;
    }

    public void setMakeTime(long makeTime) {
        this.makeTime = makeTime;
    }

    @Id
    @Column(name = "user_id")
    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
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

    @Column(name = "course_name")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Column(name = "content")
    @JSON(serialize = false, deserialize = false)
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Column(name = "file_cover")
    public String getFileCover() {
        return fileCover;
    }

    public void setFileCover(String fileCover) {
        this.fileCover = fileCover;
    }

    @Column(name = "updated_time")
    public long getUpdated() {
        return updated;
    }

    public void setUpdated(long updated) {
        this.updated = updated;
    }

    @Transient
    public Map<String, Object> getJson() {
        if (json == null) {
            json = MyGson.fromJson(content, Map.class);
        }
        return json;
    }

}
