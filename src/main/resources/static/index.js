const API_KEY = '0d91afe2c40818a4cf15b8220f647deb'
    // AJAX 요청을 보냄 ->날씨 정보를 받아와서 표시하는 함수

    var map;
function init() {
    // 좌표계 설정
    initProj();

    // map 생성
    map = new ol.Map({
        target: 'map', // Map 생성할 div id
        view: new ol.View({
            center: ol.proj.transform([127.100616, 37.402142], 'EPSG:4326',
                'EPSG:3857'),
            zoom: 10 // 초기 지도 위치 줌레벨
        }),
        logo: false,
        controls: ol.control.defaults({
            attribution: false
        }),
    });

    // 풀스크린 컨트롤러
    map.addControl(new ol.control.FullScreen());

    // 배경지도 레이어 추가
    addBaseLayer(map);

    // 배경지도 선택 select
    initBaseLayerSelect(map);

    // Geolocation
    initGeolocation(map);

    console.log(map);
}

function initProj() {

    // 경위도
    proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');

    // google 좌표계
    proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs');

    // UTM-K 좌표계
    proj4.defs('EPSG:5179', '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

    // 중부원점(Bessel)
    proj4.defs('EPSG:2097', '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs');

    // 보정된 중부원점(Bessel)
    proj4.defs('EPSG:5174', '+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43');

    // 중부원점(GRS80) [200,000 500,000]
    proj4.defs('EPSG:5181', '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs');

    // 중부원점(GRS80) [200,000 600,000]
    proj4.defs('EPSG:5186', '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs');

    // 현 지도 좌표체계
    proj4.defs([['EPSG:5179', '+title=EPSG 5179 (long/lat) +proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'],
            ['EPSG:5174', '+title=EPSG 5174 (long/lat) +proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43']])
}

function addBaseLayer(map) {

    // ------------------------------
    // google layers
    // ------------------------------
    // google road
    var googleRoadLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            projection: 'EPSG:3857',
            url: 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
            crossOrigin: 'anonymous'
        }),
        id: 'google_road',
        visible: false
    });
    map.addLayer(googleRoadLayer);

    // google terrain
    var googleTerrainLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            projection: 'EPSG:3857',
            url: 'https://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
            crossOrigin: 'anonymous'
        }),
        id: 'google_terrain',
        visible: false
    });
    map.addLayer(googleTerrainLayer);

    // google altered road
    var googleAlteredRoadLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            projection: 'EPSG:3857',
            url: 'https://mt0.google.com/vt/lyrs=r&hl=en&x={x}&y={y}&z={z}',
            crossOrigin: 'anonymous'
        }),
        id: 'google_altered_road',
        visible: false
    });
    map.addLayer(googleAlteredRoadLayer);

    // google satellite
    var googleSatelliteLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            projection: 'EPSG:3857',
            url: 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
            crossOrigin: 'anonymous'
        }),
        id: 'google_satellite',
        visible: false
    });
    map.addLayer(googleSatelliteLayer);

    // google terrain only
    var googleTerrainOnlyLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            projection: 'EPSG:3857',
            url: 'https://mt0.google.com/vt/lyrs=t&hl=en&x={x}&y={y}&z={z}',
            crossOrigin: 'anonymous'
        }),
        id: 'google_terrain_only',
        visible: false
    });
    map.addLayer(googleTerrainOnlyLayer);

    // google hybrid
    var googleHybridLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            projection: 'EPSG:3857',
            url: 'https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
            crossOrigin: 'anonymous'
        }),
        id: 'google_hybrid',
        visible: false
    });
    map.addLayer(googleHybridLayer);
}

function initBaseLayerSelect(map) {

    // add select option
    var html = '';
    $.each(map.getLayers().getArray(), function (i, v) {
        html += '<option value="' + v.get('id') + '">' + v.get('id') + '</option>';
    });
    $('#baseLayer').append(html);

    // select event
    $('#baseLayer').change(function () {

        var layerId = $(this).val();
        $.each(map.getLayers().getArray(), function (i, v) {
            if (layerId == v.get('id')) {
                v.setVisible(true);
            } else {
                v.setVisible(false);
            }
        });

    });

    // 초기값
    $('#baseLayer').val('google_road').trigger('change');

}

// 지오로케이션
function initGeolocation(map) {

    // [내위치로 이동] 버튼 이벤트
    $('#btn-current').click(function () {
        var pos = geolocation.getPosition();
        if (pos == null) {
            return;
        }
        map.getView().animate({
            center: pos,
            zoom: 18,
            duration: 1000
        });
    });

    var geolocation = new ol.Geolocation({
        tracking: true,
        projection: map.getView().getProjection()
    });

    window.geolocation = geolocation;

    function el(id) {
        return document.getElementById(id);
    }

    var accuracyFeature = new ol.Feature();
    geolocation.on('change:accuracyGeometry', function () {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    // 포인트 객체
    var positionFeature = new ol.Feature();
    positionFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#3399CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        }));

    geolocation.on('change:position', function () {
        var coordinates = geolocation.getPosition();
        positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
    });

    new ol.layer.Vector({
        map: map,
        source: new ol.source.Vector({
            features: [accuracyFeature, positionFeature]
        })
    });
}

function getWeather() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var weatherData = JSON.parse(this.responseText);
            document.getElementById("weather-info").innerHTML = `
                <p>도시: ${weatherData.name}</p>
                <p>기온: ${weatherData.main.temp} °C</p>
                <p>날씨: ${weatherData.weather[0].description}</p>
            `;
        }
    };
    xhttp.open("POST", "/weatherList", true); // 상대 URL 사용
    xhttp.send();
}

let weatherObject = {}; // 변경 가능한 변수로 선언

var currentPage = 1; // 현재 페이지
var locations = []; // locations 배열을 전역 범위에서 선언
var filteredData = []; // 전역 범위에서 filteredData 배열을 선언

function getWeatherData() {
    fetch('/weatherList')
    .then(response => response.json())
    .then(data => {
        // 데이터를 받아온 후 처리하는 코드
        console.log(data);
        const guSet = new Set(); // 중복된 구를 제거하기 위한 Set

        data.forEach(item => {
            if (item.city && !guSet.has(item.city)) {
                filteredData.push(item);
                guSet.add(item.city);
            }
        });

        // 위치 정보를 locations 배열에 추가
        data.forEach(location => {
            locations.push(location);
        });

        const uniqueSidoCodes = [...new Set(Object.values(locations).map(item => item.sido))];

        const buttonsContainer = document.getElementById('api-sido-btn');

        uniqueSidoCodes.forEach(sidoCode => {
            const button = document.createElement('button');
            button.textContent = sidoCode;
            button.title = `${sidoCode}`
                button.addEventListener('click', () => {
                    filterWeatherDataBySido(sidoCode);
                    var lon = weatherObject.response.coord.lon;
                    var lat = weatherObject.response.coord.lat;
                    map.beforeRender(ol.animation.pan({
                            source: map.getView().getCenter(),
                            duration: 1600
                        }));

                    map.getView().setCenter(
                        new ol.geom.Point([lon, lat]).transform('EPSG:4326', 'EPSG:3857').getCoordinates());

                    map.getView().setZoom(parseInt(13));
                    console.log(`Button with sido code ${sidoCode} clicked`);
                });
            buttonsContainer.appendChild(button);
        });
        // 날씨 데이터 표시
        displayWeatherData(locations);

    })
    .catch(error => {
        console.error('Error fetching weather data:', error);
    });
}

function filterWeatherDataBySido(sido) {
    $('#api-table-tbody').empty(); // Clear existing table data
    const requests = []; // Array to store AJAX requests
    filteredData.forEach((location, index) => {
        if (location.sido === sido) {
            const {
                lat,
                lon
            } = location;

            //API 요청
            $.ajax({
                type: "POST",
                url: `https://api.openweathermap.org/data/2.5/weather?lat=${lon}&lon=${lat}&lang=kor&appid=${API_KEY}&units=metric`,
                success: function (response) {
                    // 객체를 생성하여 정보를 할당합니다.
                    weatherObject = {
                        response,
                        location
                    };
                    // 처음 위치

                    var lon = weatherObject.response.coord.lon;
                    var lat = weatherObject.response.coord.lat;
                    map.beforeRender(ol.animation.pan({
                            source: map.getView().getCenter(),
                            duration: 1600
                        }));

                    map.getView().setCenter(
                        new ol.geom.Point([lon, lat]).transform('EPSG:4326', 'EPSG:3857').getCoordinates());

                    map.getView().setZoom(parseInt(13));

                    var weathericonUrl =
                        '<img src= "http://openweathermap.org/img/wn/' +
                        weatherObject.response.weather[0].icon +
                        '.png" alt="' + weatherObject.response.weather[0].description + '"/>'

                        console.log(weathericonUrl);
                    var locationRow = $('<tr></tr>');

                    // td 요소를 추가하여 내용 설정
                    locationRow.append(`
                        <td>${weatherObject.location.sido + ' ' + weatherObject.location.city}</td>
                        <td>${weatherObject.response.main.temp}</td>
                        <td>${weatherObject.response.main.temp_max}</td>
                        <td>${weatherObject.response.main.temp_min}</td>
                        <td>${weatherObject.response.main.humidity}</td>
                        <td style="text-align: center;"><div>${weathericonUrl}</div><div>${weatherObject.response.weather[0].description}</div></td>
                    `);

                    // tbody에 행 추가
                    $('#api-table-tbody').append(locationRow);
                },
                error: function (xhr, status, error) {
                    console.log("날씨 정보 가져오기 실패:", error);
                }
            });
        }
    });

}

function displayWeatherData(locations) {
    var itemsPerPage = 10;
    var startIndex = (currentPage - 1) * itemsPerPage;
    var endIndex = Math.min(startIndex + itemsPerPage, locations.length);
    var tBody = $('#db-table-tbody'); // jQuery로 요소 선택

    // 기존의 tbody 내용을 삭제
    tBody.empty();

    // locations 배열의 각 요소에 대해 반복
    $.each(locations.slice(startIndex, endIndex), function (index, location) {
        // tr 요소 생성
        var locationRow = $('<tr></tr>');

        // td 요소를 추가하여 내용 설정
        locationRow.append(`
            <td id="locationCode">${location.locationCode}</td>
            <td>${location.sido}</td>
            <td>${location.city}</td>
            <td>${location.district}</td>
            <td>${location.lat}</td>
            <td>${location.lon}</td>
            <td>${location.nx}</td>
            <td>${location.ny}</td>
            <td><button class="${location.locationCode}" id="db-update"  onclick="showPopup2();" title="수정"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-edit-circle" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 15l8.385 -8.415a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3z" /><path d="M16 5l3 3" /><path d="M9 7.07a7 7 0 0 0 1 13.93a7 7 0 0 0 6.929 -6" /></svg></button></td>
            <td><a  href="javascript:weather_delete();"><button id="db-delete"  title="삭제"><svg class="icon icon-tabler icon-tabler-square-rounded-minus"
                                                                                fill="none" height="24" stroke="currentColor"
                                                                                stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24"
                                                                                width="24" xmlns="http://www.w3.org/2000/svg">
                                                                               <path d="M0 0h24v24H0z" fill="none" stroke="none"/>
                                                                               <path d="M9 12h6"/>
                                                                               <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"/>
                                                                           </svg></button></a></td>
        `);

        // tbody에 행 추가
        tBody.append(locationRow);
    });

    // 페이징 처리
    displayPagination(locations.length);
}

function displayPagination(totalItems) {
    var itemsPerPage = 10;
    var totalPages = Math.ceil(totalItems / itemsPerPage);
    var pagination = $('#pagination'); // 페이지네이션 요소 선택

    pagination.empty(); // 기존의 페이지네이션 삭제

    // 현재 페이지 번호를 기준으로 페이지 그룹을 계산
    var currentPageGroup = Math.ceil(currentPage / 10);
    var startPage = (currentPageGroup - 1) * 10 + 1;
    var endPage = Math.min(startPage + 9, totalPages);
    // 이전 페이지 링크 추가
    if (currentPage > 1) {
        pagination.append(`<li><a href="#" onclick="changePage(${currentPage - 1})">이전</a></li>`);
    }

    // 페이지 번호 링크 추가
    for (var i = startPage; i <= endPage; i++) {
        pagination.append(`<li ${i === currentPage ? 'class="active"' : ''}><a href="#" onclick="changePage(${i})">${i}</a></li>`);
    }

    // 다음 페이지 링크 추가
    if (currentPage < totalPages) {
        pagination.append(`<li><a href="#" onclick="changePage(${currentPage + 1})">다음</a></li>`);
    }

    if ($("li").hasClass("active") === true) {
        $("li.active").css("fontWeight", "700");
    }
}

// 페이지 변경 시 호출되는 함수
function changePage(page) {
    currentPage = page;
    displayWeatherData(locations);
}

// 페이지가 로드될 때 데이터를 가져오도록 호출
document.addEventListener('DOMContentLoaded', function () {
    getWeatherData();
});

//현재위치
navigator.geolocation.getCurrentPosition(function (location) {
    const latitude = String(location.coords.latitude);
    const longitude = String(location.coords.longitude);

    // 서버로 위치 정보를 전송
    $.ajax({
        type: "GET",
        url: `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&lang=kr&units=metric&appid=0d91afe2c40818a4cf15b8220f647deb`,
        data: {
            latitude: latitude,
            longitude: longitude
        },
        success: function (response) {
            $("#btn-current").click(function () {
                $("#current").html(response.name + ' (' + response.coord.lat + ', ' + response.coord.lon + ')');
                var weather = response.weather;
                $("#current").append('<div>기온 : ' + response.main.temp + '(최대 기온 : ' + response.main.temp_max + ', 최저 기온 : ' + response.main.temp_min + ')</div>');
                $("#current").append('<div>날씨 상태 : ' + weather[0].description + '</div>');
                $("#current").append('<div>기상 조건 : ' + weather[0].main + '</div>');
            });
        },
        error: function (xhr, status, error) {
            console.log("날씨 정보 가져오기 실패:", error);
        }
    });
}, function (error) {
    console.log("위치 정보를 불러오는데 실패했습니다.", error);
});
function showPopup() {
    window.open("weatherinsert.html", "a", "width=400, height=800, left=100, top=50");
}
function showPopup2() {
    $('#db-table #db-table-tbody').on('click', 'tr', function() {
        var name = $(this).find('td:first').text(); // 클릭한 행의 첫 번째 td 요소의 텍스트 가져오기
        window.open("weatherupdate.html?location=" + name, "a", "width=400, height=800, left=100, top=50");
    });
}


// 글 등록
function weather_insert() {
    var formData = $("#detailForm").serialize();

    $.ajax({
        url: '/weatherInsert',
        type: 'POST',
        data: formData,
        success: function (response) {
            console.log('Success:', response);
            window.close(); // 자식창 끄기
            opener.location.reload(); // 부모창 리로드
        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
        }
    });
}

//db 게시판 수정
function weather_update() {
    var formData = $("#updateForm").serialize();

    var result = confirm("수정하시겠습니까?");
    console.log(formData, result);
    if(result){
        console.log(formData);
            $.ajax({
                url: '/weatherUpdate',
                type: "POST",
                data: formData,
                success: function (response) {
                    alert("수정이 완료되었습니다.");
                    window.opener.location.reload(); // 부모창 리로드
                    window.close(); // 자식창 끄기
                },
                error: function (xhr, status, error) {
                    console.error('Error:', error);
                    // 에러가 발생했을 때 사용자에게 알림을 제공하는 등의 처리를 추가할 수 있음
                }
            });
    } else {
        // 사용자가 수정 취소 시 처리할 내용이 있다면 여기에 추가
    }

}



//db 게시판 삭제
function weather_delete() {
    var nodeId = $("#location_code").text();
    console.log(nodeId);
    let d_locationCode = confirm(nodeId + "을 삭제하시겠습니까?");
    if (d_locationCode) {
        alert("삭제되었습니다.");
        $.ajax({
            url: '/weatherDelete',
            type: 'GET',
            data: {
                "locationCode": nodeId
            },
            success: function (response) {
                window.location.reload(); // 사용자가 확인을 눌렀을 때에만 페이지를 다시로드
                console.log('Success:', response);
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
            }
        });
    } else {
        alert("삭제가 취소되었습니다.");
        window.location.reload();
    }

}
// 페이지가 로드될 때 날씨 정보를 가져옴
window.onload = getWeather;
window.onload = getWeatherData;
window.onload = init;