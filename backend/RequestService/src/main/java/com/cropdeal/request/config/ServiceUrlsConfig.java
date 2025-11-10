package com.cropdeal.request.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "services")
public class ServiceUrlsConfig {
    private String user;
    private String crop;

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public String getCrop() { return crop; }
    public void setCrop(String crop) { this.crop = crop; }
}
