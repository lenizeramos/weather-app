> **Note:** This repository is a personal backup of coursework originally developed as part of my studies at Cornerstone College. It was cloned from a institutional and private repository to preserve my contributions and development history.

# Weather App – Midterm Project

Welcome to the **Weather App Challenge**!  
This project was built using **HTML**, **SASS**, and **JavaScript**. A responsive weather application that integrates real APIs for real-time data.

---

## 🌤 Challenge Overview

Integrate the following APIs:

- **[Radar Autocomplete API](https://radar.com/documentation/api#autocomplete)** – City search functionality
- **[Open-Meteo Weather API](https://open-meteo.com/en/docs)** – Weather data for current, daily, and 3-hour forecasts

### 🧑‍💻 Users should be able to:

- 🔍 Search for a city using an input field
- ⭐ Save favorite cities via a star icon
- 🌡️ View current weather for the selected city
- 📅 See 5-day weather forecast
- ⏱️ View weather for every 3 hours of a selected day
- 📱🖥️ Enjoy responsive design on mobile (375px) and desktop (1440px)

## ✅ Requirements

- HTML for structure, SASS for styles, and JavaScript for functionality.
- If location access is denied, default to **Vancouver**.
- Favorite cities must be stored in `localStorage`.
- Use media queries for mobile and desktop layouts.

---

## 🚀 Tech Stack Used

- HTML5
- SASS (SCSS)
- JavaScript (ES6+)
- [Radar API](https://radar.com/documentation/api#autocomplete)
- [Open-Meteo API](https://open-meteo.com/en/docs)

---

## 🧪 API Integration Tips

### Radar API Example

```js
const response = await fetch(
  \`https://api.radar.io/v1/search/autocomplete?query=\${query}&layers=locality&limit=5\`,
  {
    headers: {
      Authorization: RADAR_API_KEY,
    },
  }
);
```

### Open-Meteo API

- **Current Weather**
- **5-Day Forecast + 3-Hour Interval**
