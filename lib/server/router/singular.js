'use strict';

var express = require('express');
var write = require('./write');
var getFullURL = require('./get-full-url');

module.exports = function (db, name) {
  var router = express.Router();

  function show(req, res, next) {
    res.locals.data = db.get(name).value();
    next();
  }

  function create(req, res, next) {
    db.set(name, req.body).value();
    res.locals.data = db.get(name).value();

    if (res._headers && res._headers['access-control-expose-headers']) {
      var headers = res._headers['access-control-expose-headers'].replace("'", '').split(',');
      headers.push('Location');
      res.setHeader('Access-Control-Expose-Headers', headers.join(','));
    }
    res.location(`${getFullURL(req)}`);

    res.status(201);
    next();
  }

  function update(req, res, next) {
    if (req.method === 'PUT') {
      db.set(name, req.body).value();
    } else {
      db.get(name).assign(req.body).value();
    }

    res.locals.data = db.get(name).value();
    next();
  }

  var w = write(db);

  router.route('/').get(show).post(create, w).put(update, w).patch(update, w);

  return router;
};