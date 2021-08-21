"use strict";

const logger = require("../utils/logger");
const stationStore = require("../models/station-store");
const userStore = require("../models/user-store.js");

const edit = {
index(request, response) {
  const id = request.params.id;
  const viewData = {
    title: "Edit User",
    user: userStore.getUserByEmail(request.body.email),
  };
  response.render("edit", viewData);
},

  update(request, response) {
  const user = userStore.getUserByEmail(request.body.email)
    const newUser = {
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: request.body.password,
    };
userStore.updateUser(user, newUser);
response.redirect("/dashboard");
  }
};

module.exports = edit;