package com.rayshan.hello.modal;

public class ApiResponse<T> {
    private int responseCode;
    private String responseMessage;
    private T data;

    public ApiResponse(int responseCode, String responseMessage, T data) {
        this.responseCode = responseCode;
        this.responseMessage = responseMessage;
        this.data = data;
    }

    public int getResponseCode() {
        return responseCode;
    }
    public String getResponseMessage() {
        return responseMessage;
    }
    public T getData() {
        return data;
    }
}
