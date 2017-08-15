
/**
 * LeadIS Consulting
 * Autor: Juan Guillermo Gómez
 * Fecha: 21/06/2017
 * Functions en firebase para validar las respuestas y decidir que premios mostrar
 */
'use strict';

// Se importa los modulos necesarios
//const rp = require('request-promise');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
//const request = require('request');
const cors = require('cors')({ origin: true });

const breast = "BREAST";
const cervix = "CERVIX";

exports.handler = (req, resp) => {

    cors(req, resp, () => {

        // Se valida que solo se acepte peticiones GET
        if (req.method === 'PUT' || req.method === 'DELETE' || req.method === 'POST') {
            resp.status(403).send('Forbidden!');
        }

        // Se valida que se envie el UID del usuario
        if (req.query.uid === undefined ||
            req.query.uid === '' ||
            req.query.uid === null) {
            return resp.status(500).json({ "responseCode": 500, "responseError": "uid de usuario no valido" });
        }

        // Promesa para obtener las preguntas a comparar con las reglas del tipo cancer de seno
        const questionBreastProm = admin.database().ref(`preguntasReglasRespuestas/breast`)
            .once("value").then(question => { return question.val() });

        // Promesa para obtener las preguntas a comparar con las reglas del tipo cancer de cervix
        const questionCervixProm = admin.database().ref(`preguntasReglasRespuestas/cervix`)
            .once("value").then(question => { return question.val() });

        // Promesas comununes
        const commonProm = admin.database().ref(`preguntasReglasRespuestas/common`)
            .once("value").then(age => { return age.val() });

        const uid = req.query.uid; // The Firebase UID user.

        let jsonRespCancerType = [];

        console.log(`UID => ${uid}`);

        Promise.all([questionBreastProm, questionCervixProm, commonProm]).then(questions => {

            const idQuestionBreast1 = questions[0].idQuestionBreast1;
            const idQuestionBreast3 = questions[0].idQuestionBreast3;
            const idAnswerBreast1NO = questions[0].idAnswerBreast1NO;
            const idAnswerBreast1SI = questions[0].idAnswerBreast1SI;
            const idAnswerBreast3SI = questions[0].idAnswerBreast3SI;
            const idAnswerBreast2OP1 = questions[0].idAnswerBreast2OP1;
            const idAnswerBreast2OP2 = questions[0].idAnswerBreast2OP2;

            const idQuestionCervix1 = questions[1].idQuestionCervix1;
            const idAnswerCervix1NO = questions[1].idAnswerCervix1NO;
            const idAnswerCervix1SI = questions[1].idAnswerCervix1SI;
            const idAnswerCervix2OP1 = questions[1].idAnswerCervix2OP1;
            const idAnswerCervix2OP2 = questions[1].idAnswerCervix2OP2;

            const ageValidationMax = questions[2].ageValidationMax;
            const ageValidationMin = questions[2].ageValidationMin;


            // Se recupera la fecha de nacimiento para obtener los años de edad.
            admin.database().ref(`usuarios/${uid}`).child("dateBirthday")
                .once("value").then(usuBirthday => {


                    // Se obtiene la fecha de cumpleaños y se saca el año para calcular la edad.       
                    console.log(`fecha nacimiento usuario => ${usuBirthday.val()}`);

                    if (usuBirthday.val() === undefined || usuBirthday.val() === null) {
                        return resp.status(500).json({ "responseCode": 500, "response": "Fecha de nacimiento no valida" });
                    }

                    let dateBirthday = usuBirthday.val().split("/");
                    let age = parseInt((new Date().getFullYear()) - parseInt(dateBirthday[2]));

                    console.log(`edad del usuario => ${age}`);

                    let promiseValidateBreast = validateBreast(age, ageValidationMin, ageValidationMax, idQuestionBreast1,
                        idAnswerBreast1NO, idAnswerBreast1SI, idAnswerBreast2OP1, idAnswerBreast2OP2,
                        idAnswerBreast3SI, idQuestionBreast3);

                    let promiseValidateCervix = validateCervix(idQuestionCervix1, idAnswerCervix1NO, idAnswerCervix1SI,
                        idAnswerCervix2OP1, idAnswerCervix2OP2);

                    Promise.all([promiseValidateBreast, promiseValidateCervix]).then(promises => {

                        let respBreast = promises[0];
                        let respCervix = promises[1];

                        var varUpdates = {};
                        varUpdates[`usuarios/${uid}/breastIndication`] = respBreast;
                        varUpdates[`usuarios/${uid}/cervixIndication`] = respCervix;
                        admin.database().ref().update(varUpdates);

                        console.log(`Resp breast final => ${respBreast}`);
                        console.log(`Resp cervix final => ${respCervix}`);

                        return resp.status(200).json({ "responseCode": 200, "breast": respBreast, "cervix": respCervix });

                    }).catch((error) => {
                        console.log("Error => " + error);
                        return resp.status(500).json({ "responseCode": 500, "responseError": error.ReferenceError });
                    });


                }).catch((error) => {
                    console.log("Error => " + error);
                    return resp.status(500).json({ "responseCode": 500, "responseError": error.ReferenceError });
                });



        }).catch((error) => {
            console.log("Error => " + error);
            return resp.status(500).json({ "responseCode": 500, "responseError": error.ReferenceError });
        });


        function validateBreast(age, ageValidationMin, ageValidationMax, idQuestionBreast1,
            idAnswerBreast1NO, idAnswerBreast1SI, idAnswerBreast2OP1, idAnswerBreast2OP2, idAnswerBreast3SI,
            idQuestionBreast3) {

            return new Promise((resolve, reject) => {

                if (age < ageValidationMin) {
                    resolve(false);
                    return;
                }

                if (age > ageValidationMax) {

                    console.log(`Edad mayor a 50`);

                    let resp1 = admin.database().ref(`respuestas/breastCancer/${idQuestionBreast1}/${uid}`)
                        .child("respuesta0").once("value").then(respuestaId => { return respuestaId.val() });

                    let resp2 = admin.database().ref(`respuestas/breastCancer/${idQuestionBreast1}/${uid}`)
                        .child("respuesta1").once("value").then(respuestaId => { return respuestaId.val() });

                    Promise.all([resp1, resp2]).then(responses => {

                        console.log(`Respuesta BreastCancer 1 => ${responses[0]}`);
                        console.log(`Respuesta BreastCancer 2 => ${responses[1]}`);

                        if (responses[0] === null && responses[1] === null) {
                            resolve(false);
                            return;
                        }

                        if (responses[0] === idAnswerBreast1NO || responses[1] === idAnswerBreast1NO) {

                            console.log(`Respondio NO en la pregunta 1 BREAST`);
                            resolve(true);
                            return;

                        }

                        if (responses[0] === idAnswerBreast1SI || responses[1] === idAnswerBreast1SI) {

                            let nested1 = admin.database().ref(`respuestas/breastCancer/${idQuestionBreast1}/${uid}/`)
                                .child("anidada0").once("value").then(respuestaId => { return respuestaId.val() });

                            let nested2 = admin.database().ref(`respuestas/breastCancer/${idQuestionBreast1}/${uid}/`)
                                .child("anidada1").once("value").then(respuestaId => { return respuestaId.val() });

                            Promise.all([nested1, nested2]).then(nesteds => {

                                console.log(`Respuesta Anidada BreastCancer 1 => ${nesteds[0]}`);
                                console.log(`Respuesta Anidada BreastCancer 2 => ${nesteds[1]}`);

                                if (nesteds[0] === null && nesteds[1] === null) {
                                    resolve(false);
                                    return;
                                }

                                if (nesteds[0] === idAnswerBreast2OP1 || nesteds[0] === idAnswerBreast2OP2
                                    || nesteds[1] === idAnswerBreast2OP1 || nesteds[1] === idAnswerBreast2OP2) {
                                    console.log(`Respondio HACE MAS DE UN AÑO O NO RECUERDO en la pregunta 2 de breast`);

                                    resolve(true);
                                    return;
                                }

                                resolve(false);
                                return;

                            }).catch(error => {
                                console.log("Error => " + error);
                                reject(Error(error));
                                return;
                            });
                        }



                    }).catch((error) => {
                        console.log("Error => " + error);
                        reject(Error(error));
                        return;
                    });

                }

                if (age >= ageValidationMin && age <= ageValidationMax) {

                    console.log(`Edad entre 30 y 50`);

                    let resp1 = admin.database().ref(`respuestas/breastCancer/${idQuestionBreast1}/${uid}/`)
                        .child("respuesta0").once("value").then(respuestaId => { return respuestaId.val() });

                    let resp2 = admin.database().ref(`respuestas/breastCancer/${idQuestionBreast1}/${uid}/`)
                        .child("respuesta1").once("value").then(respuestaId => { return respuestaId.val() });

                    Promise.all([resp1, resp2]).then(responses => {

                        console.log(`Respuesta BreastCancer 1 => ${responses[0]}`);
                        console.log(`Respuesta BreastCancer 2 => ${responses[1]}`);

                        if (responses[0] === null && responses[1] === null) {
                            resolve(false);
                            return;
                        }

                        if (responses[0] === idAnswerBreast1NO || responses[1] === idAnswerBreast1NO) {
                            console.log(`Respondio NO en la pregunta 1 BREAST`);

                            let respNested1 = admin.database().ref(`respuestas/breastCancer/${idQuestionBreast3}/${uid}/`)
                                .child("respuesta0").once("value").then(respuestaId => { return respuestaId.val() });

                            let respNested2 = admin.database().ref(`respuestas/breastCancer/${idQuestionBreast3}/${uid}/`)
                                .child("respuesta1").once("value").then(respuestaId => { return respuestaId.val() });

                            Promise.all([respNested1, respNested2]).then(responsesNested => {

                                if (responsesNested[0] === idAnswerBreast3SI || responsesNested[1] === idAnswerBreast3SI) {
                                    resolve(true);
                                    return;
                                }

                                resolve(false);

                            }).catch((error) => {
                                console.log("Error => " + error);
                                reject(Error(error));
                                return;
                            });

                        }

                    }).catch((error) => {
                        console.log("Error => " + error);
                        reject(Error(error));
                        return;
                    });;

                }

            });
        }

        function validateCervix(idQuestionCervix1, idAnswerCervix1NO, idAnswerCervix1SI,
            idAnswerCervix2OP1, idAnswerCervix2OP2) {

            return new Promise((resolve, reject) => {

                let resp1 = admin.database().ref(`respuestas/cervixCancer/${idQuestionCervix1}/${uid}/`)
                    .child("respuesta0").once("value").then(responseId => { return responseId.val() });

                let resp2 = admin.database().ref(`respuestas/cervixCancer/${idQuestionCervix1}/${uid}/`)
                    .child("respuesta1").once("value").then(responseId => { return responseId.val() });

                Promise.all([resp1, resp2]).then(responses => {

                    console.log(`Respuesta cervixCancer 1 => ${responses[0]}`);
                    console.log(`Respuesta cervixCancer 2 => ${responses[1]}`);

                    if (responses[0] === null && responses[1] === null) {
                        resolve(false);
                        return;
                    }

                    if (responses[0] === idAnswerCervix1NO || responses[1] === idAnswerCervix1NO) {

                        console.log(`Respondio NO en la pregunta 1 de cervix`);
                        resolve(true);
                        return;
                    }

                    if (responses[0] === idAnswerCervix1SI || responses[1] === idAnswerCervix1SI) {

                        console.log(`Respondio SI en la pregunta 1 de cervix`);

                        let respNested1 = admin.database().ref(`respuestas/cervixCancer/${idQuestionCervix1}/${uid}/`)
                            .child("anidada0").once("value").then(responseId => { return responseId.val() });

                        let respNested2 = admin.database().ref(`respuestas/cervixCancer/${idQuestionCervix1}/${uid}/`)
                            .child("anidada1").once("value").then(responseId => { return responseId.val() });

                        Promise.all([respNested1, respNested2]).then(responsesNested => {

                            console.log("Nested Cervix 1 => " + responsesNested[0]);
                            console.log("Nested Cervix 2 => " + responsesNested[1]);

                            console.log("idAnswerCervix2OP1 => " + idAnswerCervix2OP1);
                            console.log("idAnswerCervix2OP2 => " + idAnswerCervix2OP2);

                            if (responsesNested[0] === idAnswerCervix2OP1 || responsesNested[0] === idAnswerCervix2OP2
                                || responsesNested[1] === idAnswerCervix2OP1 || responsesNested[1] === idAnswerCervix2OP2) {
                                console.log(`Respondio HACE MAS DE UN AÑO O NO RECUERDO en la pregunta 2 de cervix`);
                                resolve(true);
                                return;
                            }

                            resolve(false);

                        }).catch((error) => {
                            console.log("Error => " + error);
                            reject(Error(error));
                            return;
                        });
                    }

                }
                ).catch((error) => {
                    console.log("Error => " + error);
                    reject(Error(error));
                    return;
                });

            });

        }


    });

};