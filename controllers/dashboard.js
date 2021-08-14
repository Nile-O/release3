"use strict";

const accounts = require("./accounts.js");
const logger = require("../utils/logger");
const stationCollection = require("../models/station-store.js");
const stationStore = require("../models/station-store");
const uuid = require('uuid');

const dashboard = {
  index: function(request, response) {
    logger.info("dashboard rendering");
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