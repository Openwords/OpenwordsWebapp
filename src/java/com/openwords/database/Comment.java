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
@Table(name = "comment")
public class Comment implements Serializable {

    private static final long serialVersionUID = 1L;

    private long userId, makeTime;
    private String content;
    private Map<String, Object> json;

    @Id
    @Column(name = "user_id")
    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    @Id
    @Column(name = "make_time")
    public long getMakeTime() {
        return makeTime;
    }

    public void setMakeTime(long makeTime) {
        this.makeTime = makeTime;
    }

    @Column(name = "content")
    @JSON(serialize = false, deserialize = false)
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Transient
    public Map<String, Object> getJson() {
        if (json == null) {
            json = MyGson.fromJson(content, Map.class);
        }
        return json;
    }
}
