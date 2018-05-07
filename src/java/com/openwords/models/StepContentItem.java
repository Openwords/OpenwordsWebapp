package com.openwords.models;

public class StepContentItem {

    public static final String Item_Type_Problem = "pro";
    public static final String Item_Type_Answer = "ans";
    public static final String Item_Type_Marplot = "mar";

    public String type;
    public String text;
    public StepAttachItem[] attach;
    public StepContentItem[] items;

    public StepContentItem() {
    }

    public StepContentItem(String type, String text, StepAttachItem[] attach) {
        this.type = type;
        this.text = text;
        if (attach != null) {
            if (attach.length > 0) {
                this.attach = attach;
            }
        }
    }

}
