
/**
 * LeadIS Consulting
 * Autor: Juan Guillermo Gómez
 * Fecha: 24/04/2017
 * Functions en firebase para eliminar la info de los usuarios cuando se elimine su cuenta
 */
'use strict';

// Se importa los modulos necesarios
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.handler = (event) => {

  const uid = event.data.uid; // The Firebase UID user.
  admin.database().ref(`/respuestas/breastCancer/${uid}`).remove(); 
  admin.database().ref(`/respuestas/cervixCancer/${uid}`).remove(); 
  admin.database().ref(`/citas/${uid}`).remove(); 
  return admin.database().ref(`/usuarios/${uid}`).remove(); 

};

