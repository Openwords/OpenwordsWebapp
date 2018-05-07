package com.openwords.models;

import com.openwords.database.Lesson;
import java.util.LinkedList;
import java.util.List;

/**
 *
 * @author hanaldo
 */
public class CourseContent {

    public List<Lesson> lessons = new LinkedList<>();
    public String comment, authorName;
}
