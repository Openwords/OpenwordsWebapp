package com.openwords.utils;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Map.Entry;
import org.apache.commons.io.FileUtils;

public class UpdateLanguageFile {

    public static final String utf8 = "utf-8";

    public static void main(String[] args) throws IOException {
        updateFile("zh-hk", readDefault("web/mobile/controls/default_translation.js"));
    }

    private static void updateFile(String lang, Map<String, String> en) throws IOException {
        File file = new File("web/mobile/static_data/translations/" + lang + ".json");
        int count = 0;
        if (file.exists()) {
            Map<String, String> target = MyGson.fromJson(FileUtils.readFileToString(file, utf8), Map.class);
            for (Entry<String, String> item : en.entrySet()) {
                if (!target.containsKey(item.getKey())) {
                    target.put(item.getKey(), item.getValue());
                    count += 1;
                }
            }
            FileUtils.writeStringToFile(file, MyGson.toPrettyJson(target), utf8);
        } else {
            FileUtils.writeStringToFile(file, MyGson.toPrettyJson(en), utf8);
            count = en.size();
        }
        System.out.println(lang + ".json 共新添" + count + "项翻译");
    }

    private static Map<String, String> readDefault(String file) throws IOException {
        String js = FileUtils.readFileToString(new File(file), "utf-8");
        js = js.split(";")[0];
        js = "{" + js.split("\\{")[1];
        return MyGson.fromJson(js, Map.class);
    }
}
