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
@Table(name = "stats")
public class Stats implements Serializable {

    private static final long serialVersionUID = 1L;

    private long userId, updated;
    private String objectId, objectType, info;
    private Map<String, Object> json;

    public Stats() {
    }

    public Stats(long userId, long updated, String objectId, String objectType) {
        this.userId = userId;
        this.updated = updated;
        this.objectId = objectId;
        this.objectType = objectType;
    }

    @Id
    @Column(name = "object_id")
    public String getObjectId() {
        return objectId;
    }

    public void setObjectId(String objectId) {
        this.objectId = objectId;
    }

    @Id
    @Column(name = "object_type")
    public String getObjectType() {
        return objectType;
    }

    public void setObjectType(String objectType) {
        this.objectType = objectType;
    }

    @Id
    @Column(name = "user_id")
    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    @Column(name = "info")
    @JSON(serialize = false, deserialize = false)
    public String getInfo() {
        return info;
    }

    public void setInfo(String info) {
        this.info = info;
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
            json = MyGson.fromJson(info, Map.class);
        }
        return json;
    }
}
