import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [cities, setCities] = useState(["Austin", "Dallas", "Houston"]);
  const [currentCity, setCurrentCity] = useState("Austin");
  const [times, setTimes] = useState(["1:00", "2:00"]);
  const [temps, setTemps] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [isInvalid, setIsInvalid] = useState(false);
  const [newCity, setNewCity] = useState("");

  // get latitude and longitude of a city if it exists
  // else returns undefined for both when it is an invalid city
  const fetchLocation = async (currentCity) => {
    try {
      let cityData = await axios.get(
        "https://geocoding-api.open-meteo.com/v1/search?name=" + currentCity
      );
      console.log(
        "https://geocoding-api.open-meteo.com/v1/search?name=" + currentCity
      );

      if (cityData.data.results) {
        if (cityData.data.results[0].name === currentCity) {
          return [
            cityData.data.results[0].latitude,
            cityData.data.results[0].longitude,
          ];
        } else {
          return [undefined, undefined];
        }
      }
      return cityData;
    } catch (error) {
      console.log(error);
      return [undefined, undefined];
    }
  };

  // fetch new data when a different button is pressed
  useEffect(() => {
    const fetchTemps = async (latitude, longitude) => {
      try {
        const { data } = await axios(
          "https://api.open-meteo.com/v1/forecast?latitude=" +
            latitude +
            "&longitude=" +
            longitude +
            "&hourly=temperature_2m&temperature_unit=fahrenheit"
        );
        console.log(
          "https://api.open-meteo.com/v1/forecast?latitude=" +
            latitude +
            "&longitude=" +
            longitude +
            "&hourly=temperature_2m&temperature_unit=fahrenheit"
        );

        // show first 10 hours from present
        setTimes(data.hourly.time.slice(0, 10));
        setTemps(data.hourly.temperature_2m.slice(0, 10));
      } catch (error) {
        console.log(error);
        setTemps([]);
        setTimes([]);
      }
      setLoading(false);
    };

    // fetch location first to get lat and long, then fetch temps
    setLoading(true);
    fetchLocation(currentCity).then((location) =>
      fetchTemps(location[0], location[1])
    );
  }, [setTimes, setTemps, setLoading, currentCity]);

  // update what is currently in input field
  // sanitizing it before it actually gets added
  const handleChange = (e) => {
    let city = e.target.value.toLowerCase();
    city = city.charAt(0).toUpperCase() + city.slice(1);
    setIsInvalid(false);
    setNewCity(city);
  };

  // add new city if not in current array
  const addNewCity = () => {
    if (!cities.includes(newCity)) {
      // look up lat long if not valid don't add
      // MUST promise because fetchLocation is async
      fetchLocation(newCity).then((coords) => {
        if (coords[0] !== undefined) {
          setIsInvalid(false);
          let newCities = cities;
          newCities.push(newCity);
          setCities(newCities);

          // this gets to rerender automatically instead of after editing the input field
          // idk why this works but it works so
          setNewCity("");
        } else {
          // tell user invalid city
          setIsInvalid(true);
        }
      });
    }
  };

  // list of cities in buttons
  const ButtonList = ({ cities }) => {
    return cities.map((city, index) => {
      return (
        <button
          // special css if current button is selected
          className={currentCity === city ? "active" : ""}
          key={index}
          onClick={() => {
            let curCity = { city };
            setCurrentCity(curCity.city);
          }}
        >
          {city}
        </button>
      );
    });
  };

  return (
    <div className="App">
      <h1>Displaying Weather for {currentCity}</h1>

      {/* Button List */}
      <ButtonList cities={cities} />

      <br></br>
      <br></br>

      {/* Text Input */}
      <input type="text" onChange={handleChange}></input>
      <button onClick={addNewCity}>+</button>

      <div>
        {isInvalid ? (
          <p>Latitude and longitude for {newCity} not found!</p>
        ) : (
          <p></p>
        )}
      </div>

      {/* Data */}
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {times.map((time, index) => {
              const temp = temps[index];
              return (
                <p key={index}>
                  {time.slice(5, 7)}-{time.slice(8, 10)}-{time.slice(0, 4)}{": "}
                  {time.slice(-5)} {Math.round(temp)} F
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
