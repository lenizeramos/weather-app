document.addEventListener("DOMContentLoaded", () => {
  let latitude = document.getElementById("latitude");
  let longitude = document.getElementById("longitude");
  getUserCurrentLocation();
  main();
});

function main() {
  let autocompleteInput = document.getElementById("autocomplete_input");
  let autocompleteCities = document.getElementById("autocomplete_cities");
  let isSearching = false;

  autocompleteInput.addEventListener("input", () => {
    const city = autocompleteInput.value.trim().toLowerCase();
    autocompleteCities.innerHTML = "";
    if (city.length > 2 && !isSearching) {
      isSearching = true;
      fetchAutocompleteRadarApi(city, 10).then((filteredCities) => {
        console.log(filteredCities);
        if (filteredCities.length === 0) {
          const noResultsDiv = document.createElement("div");
          noResultsDiv.textContent = "No results found";
          noResultsDiv.classList.add("autocomplete-city");
          autocompleteCities.appendChild(noResultsDiv);
        } else {
          filteredCities.forEach((city) => {
            const div = document.createElement("div");
            div.textContent = city.formattedAddress;
            div.classList.add("autocomplete-city");
            div.addEventListener("click", () => {
              autocompleteInput.value = city.formattedAddress;
              latitude.value = city.latitude;
              longitude.value = city.longitude;
              autocompleteCities.innerHTML = "";
            });
            autocompleteCities.appendChild(div);
          });
        }
        isSearching = false;
      });
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target !== autocompleteInput) {
      autocompleteCities.innerHTML = "";
    }
  });

  async function fetchAutocompleteRadarApi(city, limit) {
    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "prj_test_pk_3d00dceaab6b3dd8142567ff19565bcf79df6489"
    );

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const url = `https://api.radar.io/v1/search/autocomplete?query=${city}&limit=${limit}&layers=locality`;

    try {
      const response = await fetch(url, requestOptions);
      const result = await response.json();
      return result.addresses.map((address) => address);
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }
}

function getUserCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latitude.value = position.coords.latitude;
        longitude.value = position.coords.longitude;
      },
      (error) => {
        console.error("Error getting location: ", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }
}
