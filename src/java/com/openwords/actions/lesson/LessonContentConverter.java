package com.openwords.actions.lesson;

import com.openwords.models.StepAttachItem;
import com.openwords.models.StepContent;
import com.openwords.models.StepContentItem;
import com.openwords.utils.UtilLog;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class LessonContentConverter {

    public static List<StepContent> getStepsFromText(List<String> lines) {
        List<StepContent> steps = new LinkedList<>();
        StepContent stepContent = null;
        Queue<StepContentItem> answerWaitQueue = new LinkedList<>();

        for (String line : lines) {
            String betterLine = line.trim();
            if (betterLine.isEmpty()) {
                continue;
            }
            if (betterLine.startsWith("=")) {
                if (stepContent != null) {
                    if (!stepContent.lines.isEmpty()) {
                        insertAnswerItem(stepContent, answerWaitQueue);
                        steps.add(stepContent);
                    }
                }
                stepContent = new StepContent();
                answerWaitQueue.clear();

            } else if (betterLine.startsWith("*")) {
                final List<StepContentItem> newLine = new LinkedList<>();

                readOneLineItems(betterLine, new GotOneItem() {

                    @Override
                    public void gotOne(String item, List<StepAttachItem> attachments) {
                        if (attachments.isEmpty()) {
                            newLine.add(new StepContentItem(StepContentItem.Item_Type_Problem, item, null));
                        } else {
                            newLine.add(new StepContentItem(StepContentItem.Item_Type_Problem, item,
                                    attachments.toArray(new StepAttachItem[attachments.size()])));
                        }
                    }
                });
                if (!newLine.isEmpty()) {
                    stepContent.lines.add(newLine);
                }

            } else if (betterLine.startsWith("#")) {
                StepContentItem answerItem = new StepContentItem(StepContentItem.Item_Type_Answer, null, null);
                List<StepContentItem> group = new LinkedList<>();

                readOneLineItems(betterLine, new GotOneItem() {
                    @Override
                    public void gotOne(String item, List<StepAttachItem> attachments) {
                        if (attachments.isEmpty()) {
                            group.add(new StepContentItem(
                                    StepContentItem.Item_Type_Answer,
                                    item,
                                    null
                            ));
                        } else {
                            group.add(new StepContentItem(
                                    StepContentItem.Item_Type_Answer,
                                    item,
                                    attachments.toArray(new StepAttachItem[attachments.size()])
                            ));
                        }

                    }
                });
                if (group.size() > 1) {
                    answerItem.items = group.toArray(new StepContentItem[group.size()]);
                    answerWaitQueue.add(answerItem);//no root text node
                } else {
                    answerWaitQueue.add(group.get(0));//answer item will have root text node
                }

            } else if (betterLine.startsWith("%")) {
                StepContent local = stepContent;
                readOneLineItems(betterLine, new GotOneItem() {
                    @Override
                    public void gotOne(String item, List<StepAttachItem> attachments) {
                        if (attachments.isEmpty()) {
                            local.marplots.add(new StepContentItem(
                                    StepContentItem.Item_Type_Marplot,
                                    item,
                                    null
                            ));
                        } else {
                            local.marplots.add(new StepContentItem(
                                    StepContentItem.Item_Type_Marplot,
                                    item,
                                    attachments.toArray(new StepAttachItem[attachments.size()])
                            ));
                        }
                    }
                });
            }
        }
        if (stepContent != null) {
            if (!stepContent.lines.isEmpty()) {
                insertAnswerItem(stepContent, answerWaitQueue);
                steps.add(stepContent);
            }
        }

        return steps;
    }

    private static void insertAnswerItem(StepContent content, Queue<StepContentItem> answerWaitQueue) {
        boolean hasBlank = false;
        for (List<StepContentItem> line : content.lines) {
            for (int i = 0; i < line.size(); i++) {
                StepContentItem item = line.get(i);
                if (item.type.equals(StepContentItem.Item_Type_Problem) && item.text.isEmpty()) {
                    line.set(i, answerWaitQueue.remove());//swap blank item to answer item
                    hasBlank = true;
                }
            }
        }
        if (!answerWaitQueue.isEmpty()) {
            UtilLog.logWarn(LessonContentConverter.class, "answer items are more than blanks?");
        }
        if (!hasBlank) {
            UtilLog.logWarn(LessonContentConverter.class, "no blanks?");
            if (answerWaitQueue.size() == 1) {
                UtilLog.logInfo(LessonContentConverter.class, "sm");
                List<StepContentItem> line = new LinkedList<>();
                line.add(answerWaitQueue.remove());
                content.lines.add(line);
            }
        }
    }

    private static void readOneLineItems(String line, GotOneItem callback) {
        String s = "";
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '[') {
                s = "";
                continue;
            }
            if (c == ']') {
                List<StepAttachItem> attachments = new LinkedList<>();
                if (i + 1 < line.length()) {
                    if (line.charAt(i + 1) == '(') {
                        //do not allow anything between item brackets and attachment brackets
                        checkAttachment(line.substring(i + 1, line.length()), attachments);
                    }
                }
                if (callback != null) {
                    callback.gotOne(s, attachments);
                }
                continue;
            }
            s += c;
        }
    }

    public static void checkAttachment(String attachLine, List<StepAttachItem> back) {
        String s = "";
        for (int i = 0; i < attachLine.length(); i++) {
            char c = attachLine.charAt(i);
            if (c == '(') {
                s = "";
                continue;
            }
            if (c == ')') {
                String[] parts = s.split("::");
                StepAttachItem att = new StepAttachItem(parts[0]);
                if (parts.length >= 2) {
                    att.uri = parts[1];
                }
                back.add(att);
                if (i == attachLine.length() - 1) {
                    return;
                }
                if (attachLine.charAt(i + 1) == '(') {
                    continue;
                } else {
                    return;//do not allow anything between attachment brackets
                }
            }
            if (c == '[') {
                return;
            }
            s += c;
        }
    }

    private LessonContentConverter() {
    }

}
