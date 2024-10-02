const DEFAULT_CITY = 'Краснодар';

const getCoordinates = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((location) => {
            const latitude = location.coords.latitude;
            const longitude = location.coords.longitude;
            resolve({latitude, longitude});
        }, (error) => {
            reject(error);
        });
    });
};

const getWeather = async () => {
    let data = null;
    try {
        const coordinates = await getCoordinates();
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude.toFixed(6)}&longitude=${coordinates.longitude.toFixed(6)}&current_weather=true&hourly=relativehumidity_2m`);
        data = await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
    return data;
};

const getCityName = async (latitude, longitude) => {
    let cityName = DEFAULT_CITY;
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`);
        const data = await response.json();
        cityName = data.city || cityName;
    } catch (error) {
        console.error('Error:', error);
    }
    return cityName;
};

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const clockElement = document.querySelector('.clock');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;

    updateDate(now);
}

function updateDate(date) {
    const daysOfWeek = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const months = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];

    const dateElement = document.querySelector('.date');
    dateElement.textContent = `${dayOfWeek}, ${dayOfMonth} ${month}`;
}


const displayWeather = async () => {
    const background = document.querySelector('.background');
    background.classList.add('visible');
    const data = await getWeather();
    const weatherDiv = document.querySelector('.weather');

    weatherDiv.innerHTML = '';

    const cityName = await getCityName(data.latitude, data.longitude);

    const city = document.createElement('h2');
    city.textContent = `${cityName}`;

    const temperature = document.createElement('p');
    temperature.textContent = `Температура: ${data.current_weather.temperature}°C`;

    const wind = document.createElement('p');
    wind.textContent = `Ветер: ${data.current_weather.windspeed} км/ч`;

    const humidity = document.createElement('p');
    humidity.textContent = `Влажность: ${data.hourly.relativehumidity_2m[0]} %`;
    console.log(data)

    // Добавление элементов в weatherDiv
    weatherDiv.appendChild(city);
    weatherDiv.appendChild(temperature);
    weatherDiv.appendChild(wind);
    weatherDiv.appendChild(humidity);
    setInterval(updateClock, 1000);
    updateClock();

};
displayWeather()