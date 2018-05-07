package com.openwords.utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.jar.JarInputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import org.apache.commons.io.IOUtils;

public class MyZipUtil {

    public static void doZip(List<String> filePath, String targetPath) throws FileNotFoundException, IOException {
        FileOutputStream fos = new FileOutputStream(targetPath);
        try (ZipOutputStream zos = new ZipOutputStream(fos)) {
            for (String path : filePath) {
                File srcFile = new File(path);
                try (FileInputStream fis = new FileInputStream(srcFile)) {
                    zos.putNextEntry(new ZipEntry(srcFile.getName()));
                    IOUtils.copy(fis, zos);
                    zos.closeEntry();
                }
            }
        }
    }

    public static void unZip(File file, String folder, String[] mainPage) throws FileNotFoundException, IOException {
        new File(folder).mkdir();
        FileInputStream fis = new FileInputStream(file);
        ZipInputStream zis = new JarInputStream(fis);
        ZipEntry ze = zis.getNextEntry();
        while (ze != null) {
            String name = ze.getName();
            if (name.contains("/.")) {
                //hidden file
                ze = zis.getNextEntry();
                continue;
            }
            File f = new File(folder + name);
            if (name.endsWith("/")) {
                //is folder
                f.mkdir();
            } else {
                IOUtils.copy(zis, new FileOutputStream(f));
                if (name.contains("htm") || name.contains("html")) {
                    mainPage[0] = name;
                }
            }
            ze = zis.getNextEntry();
        }
    }

    private MyZipUtil() {
    }
}
