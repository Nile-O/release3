"use strict";

const accounts = require("./accounts.js");
const logger = require("../utils/logger");
const stationCollection = require("../models/station-store.js");
const stationStore = require("../models/station-store");
const uuid = require('uuid');


function weatherCode(code) {
  let result = "";
  switch (code) {
    case "100":
      result = "Clear";
      break;
    case "200":
      result = "Partial clouds";
      break;
    case "300":
      result = "Cloudy";
      break;
    case "400":
      result = "Light Showers";
      break;
    case "500":
      result = "Heavy Showers";
      break;
    case "600":
      result = "Rain";
      break;
    case "700":
      result = "Snow";
      break;
    case "800":
      result = "Thunder";
      break;
  }
  return result;
}

function windDirectionText(windDirection) {
  let result = "";
  if (windDirection >= 11.25 && windDirection <= 33.75) {
    result = "North North East";
  } else if (windDirection >= 33.75 && windDirection <= 56.25) {
    result = "North East";
  } else if (windDirection >= 56.25 && windDirection <= 78.75) {
    result = "East North East";
  } else if (windDirection >= 78.75 && windDirection <= 101.25) {
    result = "East";
  } else if (windDirection >= 101.25 && windDirection <= 123.75) {
    result = "East South East";
  } else if (windDirection >= 123.75 && windDirection <= 146.25) {
    result = "South East";
  } else if (windDirection >= 146.25 && windDirection <= 168.75) {
    result = "South South East";
  } else if (windDirection >= 168.75 && windDirection <= 191.25) {
    result = "South";
  } else if (windDirection >= 191.25 && windDirection <= 213.75) {
    result = "South South West";
  } else if (windDirection >= 213.75 && windDirection <= 236.25) {
    result = "South West";
  } else if (windDirection >= 236.25 && windDirection <= 258.75) {
    result = "West South West";
  } else if (windDirection >= 258.75 && windDirection <= 281.25) {
    result = "West";
  } else if (windDirection >= 281.25 && windDirection <= 303.75) {
    result = "West North West";
  } else if (windDirection >= 303.75 && windDirection <= 326.25) {
    result = "North West";
  } else if (windDirection >= 326.25 && windDirection <= 348.75) {
    result = "North North West";
  } else if (windDirection <= 11.25) {
    result = "North";
  } else if (windDirection >= 348.75 && windDirection <= 360.00) {
    result = "North";
  }
  return result;
}

const dashboard = {
  index: function(request, response) {
    logger.info("dashboard rendering");


    let stations = stationStore.getAllStations();
    stations.sort((a,b) => (a.name > b.name) ? 1 : -1);

    for (let i = 0; i < stations.length; i++) {
      if (stations[i].readings.length != 0) {
        let latestReading = stations[i].readings[stations[i].readings.length - 1];
        stations[i].latestReading = latestReading;
        let windChill = null;
        windChill = Math.round((13.12 + (0.6215 * latestReading.temperature) - (11.37 * (Math.pow(latestReading.windSpeed, 0.16))) + ((0.3965 * latestReading.temperature) * (Math.pow(latestReading.windSpeed, 0.16)))) * 100.0) / 100.0;
        stations[i].windChill = windChill;
        let weatherText = null;
        weatherText = weatherCode((stations[i].readings[stations[i].readings.length - 1]).code);
        stations[i].weatherText = weatherText;
        let windText = null;
        windText = windDirectionText((stations[i].readings[stations[i].readings.length - 1]).windDirection);
        stations[i].windText = windText;
        let tempF = ((stations[i].readings[stations[i].readings.length - 1]).temperature * 9 / 5) + 32;
        stations[i].tempF = tempF;

        let maxTemp = 0;
        if (stations[i].readings.length > 0) {
          maxTemp = stations[i].readings[0].temperature;
          for (let i= 1; i < stations[i].readings.length; i++) {
            if (stations[i].readings[i].temperature > maxTemp) {
              maxTemp = stations[i].readings[i].temperature
            }
          }
        }
        stations[i].readings.maxTemp = maxTemp;

        let minTemp = 0;
        if (stations[i].readings.length > 0) {
          minTemp = stations[i].readings[0].temperature;
          for (let i= 1; i < stations[i].readings.length; i++) {
            if (stations[i].readings[i].temperature < minTemp) {
              minTemp = stations[i].readings[i].temperature
            }
          }
        }
        stations[i].readings.minTemp = minTemp;

        let maxWind = 0;
        if (stations[i].readings.length > 0) {
          maxWind = stations[i].readings[0].windSpeed;
          for (let i= 1; i < stations[i].readings.length; i++) {
            if (stations[i].readings[i].windSpeed > maxWind) {
              maxWind = stations[i].readings[i].windSpeed
            }
          }
        }
        stations[i].readings.maxWind = maxWind;

        let minWind = 0;
        if (stations[i].readings.length > 0) {
          minWind = stations[i].readings[0].windSpeed;
          for (let i= 1; i < stations[i].readings.length; i++) {
            if (stations[i].readings[i].windSpeed < minWind) {
              minWind = stations[i].readings[i].windSpeed
            }
          }
        }
        stations[i].readings.minWind = minWind;

        let maxPressure = 0;
        if (stations[i].readings.length > 0) {
          maxPressure = stations[i].readings[0].pressure;
          for (let i= 1; i < stations[i].readings.length; i++) {
            if (stations[i].readings[i].pressure > maxPressure) {
              maxPressure = stations[i].readings[i].pressure
            }
          }
        }
        stations[i].readings.maxPressure = maxPressure;

        let minPressure = 0;
        if (stations[i].readings.length > 0) {
          minPressure = stations[i].readings[0].pressure;
          for (let i= 1; i < stations[i].readings.length; i++) {
            if (stations[i].readings[i].pressure < minPressure) {
              minPressure = stations[i].readings[i].pressure
            }
          }
        }
        stations[i].readings.minPressure = minPressure;
      }

      let tempTrend = null;
      const trendValues = new Array(stations[i].readings[(stations[i].readings.length - 3)], stations[i].readings[(stations[i].readings.length - 2)], stations[i].readings[(stations[i].readings.length - 1)]);
      if (stations[i].readings.length > 2) {
        if ((trendValues[0].temperature > trendValues[1].temperature) && (trendValues[1].temperature > trendValues[2].temperature)) {
          tempTrend = "Falling";
        } else if ((trendValues[0].temperature < trendValues[1].temperature) && (trendValues[1].temperature < trendValues[2].temperature)) {
          tempTrend = "Rising";
        } else {
          tempTrend = "Steady";
        }
        logger.debug ("Temp Trend :" + tempTrend);
        stations[i].readings.tempTrend = tempTrend;
      }

      let windTrend = null;
      const windTrendValues = new Array(stations[i].readings[(stations[i].readings.length - 3)], stations[i].readings[(stations[i].readings.length - 2)], stations[i].readings[(stations[i].readings.length - 1)]);
      if (stations[i].readings.length > 2) {
        if ((windTrendValues[0].windSpeed > windTrendValues[1].windSpeed) && (windTrendValues[1].windSpeed > windTrendValues[2].windSpeed)) {
          windTrend = "Falling";
        } else if ((windTrendValues[0].windSpeed < windTrendValues[1].windSpeed) && (windTrendValues[1].windSpeed < windTrendValues[2].windSpeed)) {
          windTrend = "Rising";
        } else {
          windTrend = "Steady";
        }
        logger.debug ("Wind Trend :" + windTrend);
        stations[i].readings.windTrend = windTrend;
      }

      let pressureTrend = null;
      const pressureTrendValues = new Array(stations[i].readings[(stations[i].readings.length - 3)], stations[i].readings[(stations[i].readings.length - 2)], stations[i].readings[(stations[i].readings.length - 1)]);
      if (stations[i].readings.length > 2) {
        if ((pressureTrendValues[0].pressure > pressureTrendValues[1].pressure) && (pressureTrendValues[1].pressure > pressureTrendValues[2].pressure)) {
          pressureTrend = "Falling";
        } else if ((pressureTrendValues[0].pressure < pressureTrendValues[1].pressure) && (pressureTrendValues[1].pressure < pressureTrendValues[2].pressure)) {
          pressureTrend = "Rising";
        } else {
          pressureTrend = "Steady";
        }
        logger.debug ("pressure Trend :" + pressureTrend);
        stations[i].readings.pressureTrend = pressureTrend;
      }
      }


    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: "WeatherTop Dashboard",
      stations: stationStore.getUserStations(loggedInUser.id),
      users: loggedInUser,
    };
    logger.info("about to render", stationStore.getAllStations());
    response.render("dashboard", viewData);
  },

  addStation(request, response)
  {
    const loggedInUser = accounts.getCurrentUser(request);
    const newStation = {
      id: uuid.v1(),
      userid: loggedInUser.id,
      name: request.body.name,
      latitude: request.body.latitude,
      longitude: request.body.longitude,
      readings: [],
    };
    stationStore.addStation(newStation);
    response.redirect('/dashboard');
  },

  deleteStation(request, response) {
    const stationId = request.params.id;
    logger.debug('Deleting Station');
    stationStore.removeStation(stationId);
    response.redirect("/dashboard");
  }

}
module.exports = dashboard;