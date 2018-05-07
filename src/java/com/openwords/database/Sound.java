package com.openwords.database;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "sound")
public class Sound implements Serializable {

    private static final long serialVersionUID = 1L;

    private long userId, updated;
    private String text, lang, file;

    public Sound() {
    }

    public Sound(long userId, long updated, String text, String lang, String file) {
        this.userId = userId;
        this.updated = updated;
        this.text = text;
        this.lang = lang;
        this.file = file;
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
    @Column(name = "updated_time")
    public long getUpdated() {
        return updated;
    }

    public void setUpdated(long updated) {
        this.updated = updated;
    }

    @Column(name = "sound_text")
    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    @Column(name = "language")
    public String getLang() {
        return lang;
    }

    public void setLang(String lang) {
        this.lang = lang;
    }

    @Column(name = "file_path")
    public String getFile() {
        return file;
    }

    public void setFile(String file) {
        this.file = file;
    }

}
