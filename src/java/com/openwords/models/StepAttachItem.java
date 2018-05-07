package com.openwords.models;

public class StepAttachItem {

    public static final String[] Attachment_Types = new String[]{
        "sound-out",
        "sound-in",
        "image-out",
        "image-in",
        "type-in"};

    public String type, uri;

    public StepAttachItem() {
    }

    public StepAttachItem(String type) {
        for (String t : Attachment_Types) {
            if (t.equals(type)) {
                this.type = t;
                return;
            }
        }
    }

}
