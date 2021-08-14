'use strict';

const logger = require('../utils/logger');
const stationStore = require('../models/station-store.js');
const uuid = require('uuid');
const accounts = require('../controllers/accounts.js');


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

const station = {
  index(request, response) {
    const stationId = request.params.id;
    logger.debug('Station id = ', stationId);
    const station = stationStore.getStation(stationId);
    if (station.readings.length !== 0) {
        let latestReading = station.readings[station.readings.length - 1];
        station.latestReading = latestReading;
        let windChill = null;
        windChill = Math.round((13.12 + (0.6215 * latestReading.temperature) - (11.37 * (Math.pow(latestReading.windSpeed, 0.16))) + ((0.3965 * latestReading.temperature) * (Math.pow(latestReading.windSpeed, 0.16)))) * 100.0) / 100.0;
        station.windChill = windChill;
        let weatherText = null;
        weatherText = weatherCode(latestReading.code);
        station.weatherText = weatherText;
        let windText = null;
        windText = windDirectionText(latestReading.windDirection);
        station.windText = windText;
        let tempF = null;
        tempF = (latestReading.temperature * 9 / 5) + 32;
        station.tempF = tempF;

      let maxTemp = 0;
      if (station.readings.length > 0) {
        maxTemp = station.readings[0].temperature;
        for (let i= 1; i < station.readings.length; i++) {
          if (station.readings[i].temperature > maxTemp) {
            maxTemp = station.readings[i].temperature
          }
        }
      }
      station.maxTemp = maxTemp;

      let minTemp = 0;
      if (station.readings.length > 0) {
        minTemp = station.readings[0].temperature;
        for (let i= 1; i < station.readings.length; i++) {
          if (station.readings[i].temperature < minTemp) {
            minTemp = station.readings[i].temperature
          }
        }
      }
      station.minTemp = minTemp;

      let maxWind = 0;
      if (station.readings.length > 0) {
        maxWind = station.readings[0].windSpeed;
        for (let i= 1; i < station.readings.length; i++) {
          if (station.readings[i].windSpeed > maxWind) {
            maxWind = station.readings[i].windSpeed
          }
        }
      }
      station.maxWind = maxWind;

      let minWind = 0;
      if (station.readings.length > 0) {
        minWind = station.readings[0].windSpeed;
        for (let i= 1; i < station.readings.length; i++) {
          if (station.readings[i].windSpeed < minWind) {
            minWind = station.readings[i].windSpeed
          }
        }
      }
      station.minWind = minWind;

      let maxPressure = 0;
      if (station.readings.length > 0) {
        maxPressure = station.readings[0].pressure;
        for (let i= 1; i < station.readings.length; i++) {
          if (station.readings[i].pressure > maxPressure) {
            maxPressure = station.readings[i].pressure
          }
        }
      }
      station.maxPressure = maxPressure;

      let minPressure = 0;
      if (station.readings.length > 0) {
        minPressure = station.readings[0].pressure;
        for (let i= 1; i < station.readings.length; i++) {
          if (station.readings[i].pressure < minPressure) {
            minPressure = station.readings[i].pressure
          }
        }
      }
      station.minPressure = minPressure;
      }
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: 'Station',
      station: station,
      users: loggedInUser,
    };
    response.render("station", viewData);
  },

  addReading(request, response) {
    const stationId = request.params.id;
    const station = stationStore.getStation(stationId);
    const newReading = {
      id: uuid.v1(),
      code: request.body.code,
      temperature: request.body.temperature,
      windSpeed: request.body.windSpeed,
      windDirection: request.body.windDirection,
      pressure: request.body.pressure,
    };
    stationStore.addReading(stationId, newReading);
    logger.debug('New Reading = ', newReading);
    response.redirect('/station/' + stationId);
  },

  deleteReading(request, response) {
    const stationId = request.params.id;
    const readingId = request.params.readingid;

    stationStore.removeReading(stationId, readingId);
    response.redirect('/station/' + stationId);
  }
};

module.exports = station;