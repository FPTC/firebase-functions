/**
 * LeadIS Consulting
 * Autor: Juan Guillermo Gómez
 * Fecha: 24/04/2017
 * Functions en firebase para enviar email cuando se registran los usuarios
 */
'use strict';

// Se importa los modulos necesarios
const functions = require('firebase-functions');
const deleteUserModule = require('./deleteUser.js');
const rulesValidationAnswers = require('./rulesValidationAnswers.js');
const sendWelcomeEmail = require('./sendWelcomeEmail.js');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.cleanUserData = functions.auth.user().onDelete(deleteUserModule.handler);

exports.sendWelcomeEmail = functions.auth.user().onCreate(sendWelcomeEmail.handler);

exports.validationCancerType = functions.https.onRequest(rulesValidationAnswers.handler);