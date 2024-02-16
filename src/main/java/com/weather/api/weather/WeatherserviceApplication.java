package com.weather.api.weather;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@SpringBootApplication
public class WeatherserviceApplication {

	public static void main(String[] args) {

		SpringApplication.run(WeatherserviceApplication.class, args);
	}

}
