const weatherBlock = document.querySelector('.weather__block')
const cityInput = document.querySelector('#city')
const searchBtn = document.querySelector('#search-btn')
const list = document.querySelector('.view__list')
const currentLocationBtn = document.querySelector('.location__btn')
const searchResult = document.querySelector('#search-result')
const searchTimeoutDuration = 0
let searchTimeout = null

function addEventOnElements(){
    
    let searchItem = document.querySelectorAll('.view__item')

    for (const item of searchItem) {
        item.addEventListener('click', () => {
            getGeoWeather(item.lastChild.getAttribute('data-lat'), item.lastChild.getAttribute('data-lon'))
            cityInput.value = ''
            list.classList.remove('list-visibility')
            cityInput.classList.remove('input-city-focus')
        })
    }
}

addEventListener('load', () => {
    loadWeather('London')
})

currentLocationBtn.addEventListener('click', function(){
    window.navigator.geolocation.getCurrentPosition(res => {
        const {latitude, longitude} = res.coords 
        getGeoWeather(`lat=${latitude}`, `lon=${longitude}`)
    })})

cityInput.addEventListener('input', function(){

    list.classList.add('list-visibility')
    cityInput.classList.add('input-city-focus')
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput.value}&limit=5&appid=096614239518492eee815e86357b54df`

    searchTimeout ?? clearTimeout(searchTimeout)

    if(!cityInput.value){

        list.classList.remove('list-visibility')
        cityInput.classList.remove('input-city-focus')

        list.innerHTML = ''
    }
    if(cityInput.value){
        list.innerHTML = ''
        searchTimeout = setTimeout(() => {
            fetch(url, {method: 'GET'})
                .then(res => res.json())
                .then(data => {
                    list.classList.add('list-visibility')
                    for(const{name, lat, lon, country, state} of data){

                        let searchItem = document.createElement('li')
                        searchItem.classList.add('view__item')
                        searchItem.innerHTML = `        
                            <img src="/img/geo-icon.png" alt="" class="location__icon">
                            <div>
                                <p class="item__title">${name}</p>
                                <p class="item__subtitle">${state || ''} ${country}</p>
                            </div>
                            <a href="#" class="item__link" data-lat="lat=${lat}" data-lon="lon=${lon}"'></a>`
                            
                    searchResult.querySelector('.view__list').appendChild(searchItem)
                }
                addEventOnElements()
            })
        }, searchTimeoutDuration)
    }})

addEventListener('keypress', (e) =>{
    let city =  cityInput.value
    if(e.key === 'Enter'){
        loadWeather(city)
        cityInput.value = ''
        list.classList.remove('list-visibility')
        cityInput.classList.remove('input-city-focus')
    }
})

searchBtn.addEventListener('click', () =>{
    let city =  cityInput.value
    loadWeather(city)
    cityInput.value = ''
    list.classList.remove('list-visibility')
    cityInput.classList.remove('input-city-focus')
})


async function getGeoWeather(latitude, longitude){

    const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&${latitude}&${longitude}&appid=096614239518492eee815e86357b54df`

    const response = await fetch(url, {
        method: 'GET',
    })

    const responseResult = await response.json()

    if(response.ok){
        getWeather(responseResult)
    }else{
        weatherBlock.innerHTML = responseResult.message
    }

}

async function loadWeather(city){

    const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=096614239518492eee815e86357b54df`
    const response = await fetch(url, {
        method: 'GET',
    })
    
    const responseResult = await response.json()

    if(response.ok){
        getWeather(responseResult)
    }else{
        weatherBlock.innerHTML = responseResult.message
    }
}


function getWeather(data){
    const latitude = data.coord.lat
    const longitude = data.coord.lon
    const location = data.name
    const temp = Math.round(data.main.temp)
    const feelsLikeTemp = Math.round(data.main.feels_like)
    const weatherStatus = data.weather[0].main
    const weatherIcon = data.weather[0].icon
    const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=096614239518492eee815e86357b54df`
    const template = `
        <div class="weather__header">
            <div class="weather__main">
                <div class="weather__city">${location}</div>
                <div class="weather__status">${weatherStatus}</div>
            </div>
            <div class="weather__icon">
                <img src="http://openweathermap.org/img/w/${weatherIcon}.png" alt="Clouds">
            </div>
        </div>
        <div class="weather__temp">${temp}</div>
        <div class="weather__feels-like">Feels like: ${feelsLikeTemp}</div>`
    weatherBlock.innerHTML = template  

    fetch(url, {method: 'GET'})
        .then(res => res.json())
        .then(data => {
            let state = ''
            if(data[0].hasOwnProperty('state')) state = data[0].state
            let div = `<div class="weather__country">${state} ${data[0].country}</div>`
            let weatherCity = document.querySelector('.weather__city')
            weatherCity.insertAdjacentHTML('afterend', div) 
        })
}
