package com.openwords.utils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MyMessageDigest {

    private static MyMessageDigest instance;

    public static byte[] digest(byte[] message) throws NoSuchAlgorithmException {
        if (instance == null) {
            instance = new MyMessageDigest();
        }
        return instance.doDigest(message);
    }
    private MessageDigest md5;

    private MyMessageDigest() throws NoSuchAlgorithmException {
        md5 = MessageDigest.getInstance("MD5");
    }

    public byte[] doDigest(byte[] message) {
        md5.reset();
        md5.update(message);
        return md5.digest(message);
    }
}
