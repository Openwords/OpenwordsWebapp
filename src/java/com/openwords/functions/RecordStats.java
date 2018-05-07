package com.openwords.functions;

import com.openwords.database.Course;
import com.openwords.database.Stats;
import com.openwords.models.StatsInfo;
import com.openwords.utils.MyGson;
import com.openwords.utils.UtilLog;
import java.util.List;
import org.hibernate.Session;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;

public class RecordStats {

    public static final String Stats_Type_Course = "c";
    public static final String Stats_Type_CourseProgress = "p";

    public static synchronized void courseNewLearner(Session s, Course newCourseProgress) {
        UtilLog.logInfo(RecordStats.class, "courseNewLearner");
        try {
            recordCourseStats(s, newCourseProgress, 0, 0, newCourseProgress.getName(), true);
        } catch (Exception e) {
            UtilLog.logError(RecordStats.class, e);
        }
    }

    private static void recordCourseStats(Session s, Course newCourseProgress, int totalLearner, int totalFinish, String display, boolean addLearner) {
        String objectId = newCourseProgress.getAuthorId() + "-" + newCourseProgress.getMakeTime();
        List<Stats> rs = s.createCriteria(Stats.class)
                .add(Restrictions.eq("objectType", Stats_Type_Course))
                .add(Restrictions.eq("userId", newCourseProgress.getAuthorId()))
                .add(Restrictions.eq("objectId", objectId))
                .list();
        Stats record;
        StatsInfo info;
        if (rs.isEmpty()) {
            record = new Stats(newCourseProgress.getAuthorId(), System.currentTimeMillis(), objectId, Stats_Type_Course);
            info = new StatsInfo();
            info.totalLearner = 0;
            info.finshed = 0;
            record.setInfo("");
            s.save(record);
        } else {
            record = rs.get(0);
            info = MyGson.fromJson(record.getInfo(), StatsInfo.class);
        }
        if (addLearner) {
            info.totalLearner += 1;
        } else {
            info.totalLearner = totalLearner;
            info.finshed = totalFinish;
        }
        info.display = display;
        record.setInfo(MyGson.toJson(info));
        s.beginTransaction().commit();
    }

    public static synchronized void recomputeCourseStats(Session s, Course newCourseProgress) {
        UtilLog.logInfo(RecordStats.class, "recomputeCourseStats");
        try {
            Number totalLearner = (Number) s.createCriteria(Course.class)
                    .add(Restrictions.eq("makeTime", newCourseProgress.getMakeTime()))
                    .add(Restrictions.ne("userId", 0l))
                    .add(Restrictions.eq("authorId", newCourseProgress.getAuthorId()))
                    .setProjection(Projections.rowCount()).uniqueResult();
            String sql = "SELECT count(*) FROM courses\n"
                    + "where JSON_Extract(content, '$.totalLesson') = JSON_Extract(content, '$.totalLessonRight')\n"
                    + "and make_time=@makeTime@\n".replace("@makeTime@", String.valueOf(newCourseProgress.getMakeTime()))
                    + "and author_id=@authorId@".replace("@authorId@", String.valueOf(newCourseProgress.getAuthorId()));
            Number totalFinish = (Number) s.createSQLQuery(sql).uniqueResult();

            recordCourseStats(s, newCourseProgress, totalLearner.intValue(), totalFinish.intValue(), newCourseProgress.getName(), false);
        } catch (Exception e) {
            UtilLog.logError(RecordStats.class, e);
        }
    }

    private RecordStats() {
    }

}
