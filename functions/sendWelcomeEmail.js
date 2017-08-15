/**
 * LeadIS Consulting
 * Autor: Juan Guillermo Gómez
 * Fecha: 21/06/2017
 * Functions en firebase para enviar email de bienvenida
 */
'use strict';

// Se importa los modulos necesarios
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
//const smtpTransport = require('nodemailer-smtp-transport');

//firebase functions:config:set confemail.email="" confemail.password=""
const usermail = functions.config().confemail.email;
const passwordmail = functions.config().confemail.password;

const mailTransport = nodemailer.createTransport({
    host: 'server3.hostingfacil.co',
    port: 465,
    secure: true,
    auth: {
        user: usermail,
        pass: passwordmail
    }
});

const APP_NAME = 'Amate Cuida tu Salud';

exports.handler = (event) => {

    const user = event.data; // The Firebase user.
    const email = user.email;
    const displayName = user.displayName;

    console.log("Usemail => " + usermail);

    return sendWelcomeEmail(email, displayName);

};

// Sends a welcome email to the given user.
function sendWelcomeEmail(email, displayName) {

    const mailOptions = {
        from: '"Ámate. Cuida tu Salud" <info@leadis.co>',
        to: email
    };

    mailOptions.subject = `Bienvenida a ${APP_NAME}!`;
    mailOptions.html = `<!DOCTYPE html><html lang="es"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> <meta name="viewport" content="width=device-width, initial-scale=1"><style>.cabecera{border-bottom-color: rgb(219, 39, 99);border-bottom-style: solid;background: #FCFFFF;border-bottom-width: 5px;}.cabecera img{height: 120px; margin-top:1em; margin-bottom:1em; margin-left:5em;}.footer{width:100%; height:80px;font-family:roboto;background: rgb(219, 39, 99, 1);background: -moz-linear-gradient(left, rgb(219, 39, 99, 1) 0%, rgb(219, 39, 99, 1) 15%, rgb(219, 39, 99, 1) 100%);background: -webkit-gradient(left top, right top, color-stop(0%, rgba(219,39,99,1)), color-stop(15%, rgba(219,39,99,1)), color-stop(100%, rgba(219,39,99,1)));background: -webkit-linear-gradient(left, rgba(219,39,99,1) 0%, rrgba(219,39,99,1) 15%, rgba(219,39,99,1) 100%);background: -o-linear-gradient(left, rgba(219,39,99,1) 0%, rgba(219,39,99,1) 15%, rgb(219, 39, 99, 1) 100%);background: -ms-linear-gradient(left, rgba(219,39,99,1) 0%, rgba(219,39,99,1) 15%, rgb(219, 39, 99, 1) 100%);background: linear-gradient(to right, rgba(219,39,99,1) 0%, rgba(219,39,99,1) 15%, rgba(219,39,99,1) 100%);filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#c60167', endColorstr='#ff1f93', GradientType=1 );}.cuerpo{width:900px; border: 2px solid rgba(128, 128, 128, 0.37);}.contenido{width:100%; height: 350px; background-color:#ffffff;}.info{text-align: center; width: 70%; float: left;}.info-text{text-align:left; padding:1em;padding-left: 2em; font-size: 17px;}.info-text a {text-decoration:none; color:#FCFFFF;}.titulo-bienvenida{font-size: 51px;color: rgba(0,153,151,1);font-weight: 200; font-family:Oswald;}.redes{width:30%; float:right; height:100%;}.redes-icono{background: #FCFFFF;border-radius: 50%;padding: 0.5em;margin-top: 1.5em;}@import url('https://fonts.googleapis.com/css?family=Roboto');@import url('https://fonts.googleapis.com/css?family=Oswald');@media only screen and (max-width: 600px){.cuerpo{width:100%;}.cabecera{width: 100%;}.cabecera img{height: 80px;text-align: center;margin-top:2em; }.contenido{height: 600px; }.footer{ height: 250px; }.info{display: block;position: relative;overflow: auto;}.info-text a {display: block;}.titulo-bienvenida{font-size: 40px;}.redes{float: left;width: 100%;text-align: center;}}</style></head><body><div id="cuerpo" class="cuerpo"><div id="cabecera" class="cabecera" style="height:150px ; width:100%;" > <img src="https://firebasestorage.googleapis.com/v0/b/fptc-test.appspot.com/o/imagenes%2Flogo_amate.png?alt=media&token=79014774-f8ec-4932-97ae-27263279407f"></div><div id="contenido" class="contenido"><div style="margin:2em"><h2 class="titulo-bienvenida">BIENVENIDA</h2> <h4 style="text-decoration:none;font-weight:200;font-family:roboto; font-size:20px;color:#8a8a8a;margin-top:0px;margin-bottom:0px;">Gracias por crear tu cuenta en Ámate | Cuida tu salud</h4> <h4 style="text-decoration:none;font-weight:200;font-family:roboto; font-size:20px;color:#8a8a8a;margin-top:0px;margin-bottom:0px;"><strong>Tu usuario es: ${email}</strong></h4> <br/> <h4 style="text-decoration:none;font-weight:200;font-family:roboto; font-size:20px;color:#8a8a8a;margin-top:0px;margin-bottom:0px;">Ingresa a tu cuenta para actualizar tu información, aprender sobre el cáncer de seno y cuello uterino, y ganar premios probando tu conocimiento sobre el cáncer.</h4> <br/> <h4 style="text-decoration:none;font-weight:200;font-family:roboto; font-size:20px;color:#8a8a8a;margin-top:0px;margin-bottom:0px;">Haz clic aquí para usar nuestro aplicativo web: <a href="http://40.71.81.33/fundacancerPruebas/public/#/login" style="text-decoration:none;font-weight:200;font-family:roboto; font-size:20px;color:rgba(198,1,103,1);margin-top:0px;margin-bottom:0px;"><strong>Ámate en la web</strong></a></h4> <br/> <h4 style="text-decoration:none;font-weight:200;font-family:roboto; font-size:20px;color:#8a8a8a;margin-top:0px;margin-bottom:0px;">Haz clic aquí para descargar nuestro aplicativo móvil: <a href="http://40.71.81.33/fundacancerPruebas/public/#/login" style="text-decoration:none;font-weight:200;font-family:roboto; font-size:20px;color:rgba(198,1,103,1);margin-top:0px;margin-bottom:0px;"><strong>Ámate en el móvil</strong></a></h4> </div></div><div id="footer" class="footer"><div id="mensaje" class="info"> <h2 class="info-text"><a href="www.cuidate.co">www.cuidate.co |</a> <a href="info@amate.co" style="text-decoration:none; color:#FCFFFF;" > info@cuidate.co |</a> <a style="color:#FCFFFF;">Calle 1 #23-45 | Cali, Colombia</a></h2></div><div id="redes" class="redes"><a href="#"><img class="redes-icono" src="https://firebasestorage.googleapis.com/v0/b/fptc-test.appspot.com/o/imagenes%2Ftwitter.png?alt=media&token=1e36e06e-5eab-446a-9562-b0a40c88c83d"></a> <a href="#"><img class="redes-icono" src="https://firebasestorage.googleapis.com/v0/b/fptc-test.appspot.com/o/imagenes%2Ffacebook.png?alt=media&token=8f3eae5b-ef00-4bb3-aa12-512b9fe136bc"></a> <a href="#"><img class="redes-icono" src="https://firebasestorage.googleapis.com/v0/b/fptc-test.appspot.com/o/imagenes%2Finstagram.png?alt=media&token=7578ddb0-91d3-4f3a-a361-fea7ca22acb5"></a> <a href="#"><img class="redes-icono" src="https://firebasestorage.googleapis.com/v0/b/fptc-test.appspot.com/o/imagenes%2Fyoutube.png?alt=media&token=e463c481-5c0b-47c6-90dc-a8fa78b54e9b"></a> </div></div></div></body></html>`

    return mailTransport.sendMail(mailOptions).then(() => {
        console.log('New welcome email sent to:', email);
    }).catch((error) => {
        console.log(error);
    });
}