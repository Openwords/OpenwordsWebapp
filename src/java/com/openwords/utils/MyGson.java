package com.openwords.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.lang.reflect.Type;

public class MyGson {

    private static Gson gson;
    private static Gson prettyGson;

    public static void clean() {
        gson = null;
        prettyGson = null;
    }

    public static String toJson(Object o) {
        if (gson == null) {
            gson = new Gson();
        }
        return gson.toJson(o);
    }

    public static <T extends Object> T fromJson(String json, Type type) {
        if (gson == null) {
            gson = new Gson();
        }
        return gson.fromJson(json, type);
    }

    public static String toPrettyJson(Object o) {
        if (prettyGson == null) {
            prettyGson = new GsonBuilder().setPrettyPrinting().create();
        }
        return prettyGson.toJson(o);
    }

    public static Object cloneObject(Object o) {
        String json = MyGson.toJson(o);
        return MyGson.fromJson(json, Object.class);
    }

    private MyGson() {
    }
}
