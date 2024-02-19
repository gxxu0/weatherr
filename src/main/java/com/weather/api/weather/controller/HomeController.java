package com.weather.api.weather.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.weather.api.weather.Location;
import com.weather.api.weather.LocationRepository;
import com.weather.api.weather.LocationService;
import com.weather.api.weather.OpenWeather;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.swing.*;
import javax.transaction.Transactional;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@AllArgsConstructor
@Service
@Transactional
public class HomeController {

    private final String BASE_URL = "http://api.openweathermap.org/data/2.5/weather";
    private static final String API_KEY = "0d91afe2c40818a4cf15b8220f647deb";

    @Autowired
    private LocationService locationService;
    private LocationRepository locationRepository;

    @GetMapping("/weather")
    public String getCurrentWeather(double latitude, double longitude) {
        String url = "https://api.openweathermap.org/data/2.5/weather" +
                "?lat=" + latitude +
                "&lon=" + longitude +
                "&lang=kr" +
                "&units=metric" +
                "&appid=" + API_KEY;

        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.getForObject(url, String.class);

        System.out.println(response);
        // 응답을 바로 클라이언트에게 전송하거나, JSON 형식으로 파싱하여 다른 방식으로 응답할 수 있음
        return response;
    }

    @RequestMapping(value = "/weatherList", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<String> getAllLocationsAsJson(HttpServletRequest request, ModelAndView mav) {
        List<Location> locations = locationService.getAllLocations();

        // ObjectMapper를 사용하여 List<Location>을 JSON 문자열로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        String json;
        try {
            json = objectMapper.writeValueAsString(locations);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
//        System.out.println(ResponseEntity.ok().body(json));
//        System.out.println(json);
        // JSON 문자열을 클라이언트로 반환
        return ResponseEntity.ok().body(json);
    }

    @PostMapping("/weatherInsert")
    public String createLocation(HttpServletRequest request, @ModelAttribute("location") Location location) {
        Location createdLocation = locationService.createLocation(location);

        if (createdLocation != null) {
            // 등록된 위치 정보를 확인하기 위해 요청 파라미터를 모두 출력합니다.
            Enumeration<String> params = request.getParameterNames();
            Map<String, String> paramMap = new HashMap<>();
            while (params.hasMoreElements()) {
                String name = params.nextElement();
                String value = request.getParameter(name);
                paramMap.put(name, value);
            }
            System.out.println("Received parameters: " + paramMap);

            // 등록된 위치 정보를 클라이언트에게 응답합니다.
            return "redirect:/";
        } else {
            // 생성된 위치 정보가 null인 경우에 대한 처리
            return "redirect:/";
        }
    }

    @PostMapping("/weatherUpdateForm")
    public ModelAndView showUpdateForm(@RequestParam(value = "locationCode") String locationCode) {
        ModelAndView modelAndView = new ModelAndView("update_form"); // Assuming your update form is named update_form.html
        Optional<Location> optionalLocation = locationService.getLocationByLocationCode(locationCode);
        if (optionalLocation.isPresent()) {
            Location location = optionalLocation.get();
            modelAndView.addObject("locationCode", locationCode);
            modelAndView.addObject("location", location);
            return modelAndView;
        } else {
            // Location with the given code not found, handle accordingly
            // For example, redirect to an error page or display an error message
            return new ModelAndView("error"); // Assuming you have an error.html for displaying errors
        }
    }

    @PostMapping("/weatherUpdate")
    public String updateLocation(HttpServletRequest request, RedirectAttributes rttr, @ModelAttribute Location location) {

        Location existingLocation = locationService.getLocationByLocationCode(location.getLocationCode()).orElse(null);

        existingLocation.setSido(location.getSido());
        existingLocation.setCity(location.getCity());
        existingLocation.setDistrict(location.getDistrict());
        existingLocation.setLat(location.getLat());
        existingLocation.setLon(location.getLon());
        existingLocation.setNx(location.getNx());
        existingLocation.setNy(location.getNy());

        ModelAndView modelAndView = new ModelAndView();
        System.out.println(existingLocation);
        locationService.updateLocation(existingLocation);
        modelAndView.setViewName("/weatherList");
        return "forward:/";
    }

    @GetMapping("/weatherDelete")
    public String deleteLocation(@RequestParam(value = "locationCode") String locationCode){
        locationService.deleteLocation(locationCode);
        System.out.println(locationCode);
        return "redirect:/weatherList";
    }


}
