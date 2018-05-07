package com.openwords.actions.lesson;

import static com.opensymphony.xwork2.Action.LOGIN;
import com.openwords.database.DatabaseHandler;
import com.openwords.database.Lesson;
import com.openwords.interfaces.MyAction;
import com.openwords.models.LessonContent;
import com.openwords.models.StepContent;
import com.openwords.utils.MyGson;
import com.openwords.utils.UtilLog;
import java.io.File;
import java.util.LinkedList;
import java.util.List;
import java.util.Scanner;
import org.apache.struts2.convention.annotation.Action;
import org.apache.struts2.convention.annotation.InterceptorRef;
import org.apache.struts2.convention.annotation.ParentPackage;
import org.apache.struts2.convention.annotation.Result;
import org.hibernate.Session;

@ParentPackage("my-package")
public class UploadLesson extends MyAction {

    private static final long serialVersionUID = 1L;
    private File file;
    private String name;

    @Action(value = "/uploadLesson",
            interceptorRefs = @InterceptorRef("myStack"),
            results = {
                @Result(name = LOGIN, location = "sendHttpError", type = "redirect")
            })
    @Override
    public String execute() throws Exception {
        UtilLog.logInfo(this, "/uploadLesson: " + getUserId() + " " + name);
        if (file == null) {
            sendBadRequest("Need actual file");
            return null;
        }
        if (name == null) {
            sendBadRequest("Need name");
            return null;
        }

        Session s = DatabaseHandler.getSession();
        try {
            long now = System.currentTimeMillis();

            Lesson le = Lesson.getLesson(s, getUserId(), name);
            if (le != null) {
                getHttpResponse().sendError(901, "Lessons cannot have the same name");
                return null;
            }

            List<String> lines;
            try (Scanner scan = new Scanner(file, "UTF-8")) {
                lines = new LinkedList<>();
                while (scan.hasNextLine()) {
                    lines.add(scan.nextLine().trim().replaceAll("\uFEFF", ""));
                }
            }

            List<StepContent> steps = LessonContentConverter.getStepsFromText(lines);
            if (steps.isEmpty()) {
                sendBadRequest("No valid content");
                return null;
            }
            le = new Lesson(getUserId(), name, "", "", now);
            LessonContent content = new LessonContent();
            content.steps = steps;
            le.setContent(MyGson.toJson(content));

            s.save(le);
            s.beginTransaction().commit();

        } catch (Exception e) {
            UtilLog.logError(this, e);
            sendError(e.toString());
        } finally {
            s.close();
        }
        return null;
    }

    public void setFile(File file) {
        this.file = file;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public void setErrorMessage(String errorMessage) {
    }

}
