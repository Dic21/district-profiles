init();

async function init(){
    const result = await Promise.all([fetchAir(), fetchWeather()]);
    const data = result;
    let time = data[0];
    if(data[1]>data[0]){
        time = data[1];
    }
    console.log(data);
    document.getElementById("lastUpdate").innerHTML = time;
}

async function fetchAir() {
    let time;
    await fetch("https://www.aqhi.gov.hk/epd/ddata/html/out/aqhi_ind_rss_ChT.xml").then(res => res.text()).then((data) => {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data, "text/xml");
        let target = xmlDoc.querySelectorAll('title');
        const times = xmlDoc.querySelector('pubDate').innerHTML;
        time = new Date(times).toLocaleString("zh-HK", { timeZone: "Asia/Hong_Kong" });
        for (let i = 0; i < target.length; i++) {
            if (target[i].innerHTML.indexOf("觀塘") >= 0) {
                document.getElementById("aqhi").innerHTML = target[i].innerHTML.split(":")[1];
                document.getElementById("aqhiLevel").innerHTML = target[i].innerHTML.split(":")[2];
                aqhiColor(target[i].innerHTML.split(":")[2]);
                break;
            }
        }
    })
    return time;
}

async function fetchWeather(){
    let time;
    await fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc").then(resData => resData.json()).then((data) => {
        time = new Date(data.temperature.recordTime).toLocaleString("zh-HK", { timeZone: "Asia/Hong_Kong" });
        const list = data.temperature.data;
        const target = list.find((place) => {
            return place.place === "觀塘"
        })
        document.getElementById("currentTemp").innerHTML = `${target.value}°C`;
    })
    return time;
}

function aqhiColor(txt){
    const sign = document.querySelector("#colorSign");
    let level = txt.trim();
    if(level==="低"){
        sign.style.color = "green";
    }else if(level==="中"){
        sign.style.color = "orange";
    }else if(level==="高"){
        sign.style.color = "red";
    }else if(level==="甚高"){
        sign.style.color = "brown";
    }else if(level==="嚴重"){
        sign.style.color = "black";
    }
}   

