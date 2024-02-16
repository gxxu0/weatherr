package com.weather.api.weather.controller;

import com.weather.api.weather.OpenWeather;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.swing.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.*;

@Controller
@RestController
@RequiredArgsConstructor

public class HomeController{

    private final String BASE_URL = "http://api.openweathermap.org/data/2.5/weather";
    private final String apiKey = "0d91afe2c40818a4cf15b8220f647deb"; // 발급받은 API key
    @GetMapping("/weather")
    public OpenWeather getWeather() {
        StringBuilder urlBuilder = new StringBuilder(BASE_URL);
        urlBuilder.append("?q=Koesan");
        urlBuilder.append("&appid=" + apiKey);
        urlBuilder.append("&lang=kr");
        urlBuilder.append("&units=metric");

        RestTemplate restTemplate = new RestTemplate();
        System.out.println(restTemplate);
        System.out.println(urlBuilder);
        return restTemplate.getForObject(urlBuilder.toString(), OpenWeather.class);
    }

}