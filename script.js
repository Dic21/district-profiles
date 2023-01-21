let defaultPlace = "觀塘";
let placeCollection = {
    "油尖旺":{airStation: "旺角", hkoStation: "京士柏", color: "#e6291e"},
    "赤鱲角":{airStation: "東涌",  hkoStation: "赤鱲角", color: "#00888A"},
    "觀塘":{airStation: "觀塘",  hkoStation: "觀塘", color: "#53c353"},
    "香港仔":{airStation: "南區",  hkoStation: "黃竹坑", color: "#a5d41e"},
    "將軍澳":{airStation: "將軍澳",  hkoStation: "將軍澳", color: "#9e5fa6"}
}
init(defaultPlace);

document.getElementById("place").addEventListener("change", handlePlaceChange);

async function init(location){
    const result = await Promise.all([fetchAir(location), fetchWeather(location)]);
    const data = result;
    let time = data[0];
    if(data[1]>data[0]){
        time = data[1];
    }
    console.log(data);
    document.getElementById("lastUpdate").innerHTML = time;
}

async function fetchAir(location) {
    let time;
    await fetch("https://www.aqhi.gov.hk/epd/ddata/html/out/aqhi_ind_rss_ChT.xml").then(res => res.text()).then((data) => {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data, "text/xml");
        let target = xmlDoc.querySelectorAll('title');
        const times = xmlDoc.querySelector('pubDate').innerHTML;
        time = new Date(times).toLocaleString("zh-HK", { hourCycle: "h24", timeZone: "Asia/Hong_Kong" });

        console.log(placeCollection[location]["airStation"]);
        for (let i = 0; i < target.length; i++) {
            if (target[i].innerHTML.indexOf(placeCollection[location]["airStation"]) >= 0) {
                document.getElementById("aqhi").innerHTML = target[i].innerHTML.split(":")[1];
                document.getElementById("aqhiLevel").innerHTML = target[i].innerHTML.split(":")[2];
                aqhiColor(target[i].innerHTML.split(":")[2]);
                break;
            }
        }
    })
    return time;
}

async function fetchWeather(location){
    let time;
    await fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc").then(resData => resData.json()).then((data) => {
        time = new Date(data.temperature.recordTime).toLocaleString("zh-HK", { hourCycle: "h24", timeZone: "Asia/Hong_Kong" });
        const list = data.temperature.data;
        const target = list.find((place) => {
            return place.place === placeCollection[location]["hkoStation"]
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

function handlePlaceChange(){
    let place = document.querySelector("#place").value;
    init(place);
    let title = document.querySelector("#title");
    title.innerHTML = `${place}的事`;
    document.querySelector(".header").style.backgroundColor = placeCollection[place]["color"];
}


document.querySelectorAll(".footer>a").forEach((el)=>{
    el.addEventListener('click', function(e){
        e.preventDefault();
        chrome.tabs.create({url: e.target.href, active: false});
        return false;
    })
});

