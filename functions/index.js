/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions'),
    admin = require('firebase-admin'),
    logging = require('@google-cloud/logging')();

//var qvoJs = require('./qvo/functions.js');


admin.initializeApp(functions.config().firebase);

var fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});

var qrProyect = require('qr-image');
var promise = require('request-promise');
var MP = require("mercadopago");

const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);

const mailTransport = nodemailer.createTransport(`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);

// Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.
const APP_NAME = 'IZINAIT';


exports.createUserQvo = functions.https.onRequest((req, res) => {
    const email = req.query.email;
    const name = req.query.name;

    fetch('https://playground.qvo.cl/customers', {
        method: 'POST',
        headers: {
            'Authorization': 'Token ' + functions.config().qvo.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            name: name
        })
    })
        .then(function (res) {
            return res.json();
        })
        .then(function (body) {
        console.log(body);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(body);
        return body;

        //return admin.database().ref("/userQvo/"+data.uid+"/customer_id").set(body.id);
    });
});

exports.agregarTarjetaUsuarioQvo = functions.https.onRequest((req, res) => {
    // Grab the current value of what was written to the Realtime Database.
    const userQvo = req.query.userQvo;

    fetch('https://playground.qvo.cl/customers/' + userQvo + '/cards/inscriptions', {
        method: 'POST',
        headers: {
            'Authorization': 'Token ' + functions.config().qvo.token,
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            return_url: "https://izinait.com/app#!/codigo"
        })
    }).then(function (response) {
        console.log(response)
        return response.json();
    }).then(function (body) {
        console.log(body);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(body);
        //return res.redirect(303, body.redirect_url);

    });

});

exports.obtenerUnaInscripcionDeTarjeta = functions.https.onRequest((req, res) => {
    // Grab the current value of what was written to the Realtime Database.
    const userQvo = req.query.userQvo;
    const inscription_uid = req.query.inscription_uid;

    fetch('https://playground.qvo.cl/customers/' + userQvo + '/cards/inscriptions/'+inscription_uid, {
        method: 'GET',
        headers: {
            'Authorization': 'Token ' + functions.config().qvo.token,
            'Content-Type': 'application/json'

        }
    }).then(function (response) {
        console.log(response)
        return response.json();
    }).then(function (body) {
        console.log(body);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(body);
        //return res.redirect(303, body.redirect_url);

    });

});

exports.cobrarTarjetaDeCredito = functions.https.onRequest((req, res) => {
    // Grab the current value of what was written to the Realtime Database.
    const userQvo = req.query.userQvo;
    const tarjetaCredito = req.query.tarjetaCredito;
    const cobroTotal = req.query.cobroTotal;

    fetch('https://playground.qvo.cl/customers/' + userQvo + '/cards/' + tarjetaCredito + '/charge', {
        method: 'POST',
        headers: {
            'Authorization': 'Token ' + functions.config().qvo.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: cobroTotal
        })
    }).then(function (response) {
        console.log(response)
        return response.json();
    }).then(function (body) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log(body);
        res.status(200).send(body);
        return body;

    }).then(function (ok) {
        console.log(ok);
    });

});

exports.cobrarConWebPayPlus = functions.https.onRequest((req, res) => {
    // Grab the current value of what was written to the Realtime Database.
    const userQvo = req.query.userQvo;
    const url = "";
    const cobroTotal = req.query.cobroTotal;

    fetch('https://playground.qvo.cl/webpay_plus/charge', {
        method: 'POST',
        headers: {
            'Authorization': 'Token ' + functions.config().qvo.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: cobroTotal,
            return_url: "http://www.izinait.com/app/#!/tickets",
            customer_id: req.query.userQvo

        })
    }).then(function (response) {
        console.log(response)
        return response.json();
    }).then(function (body) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log(body);
        res.status(200).send(body);
        return body;

    }).then(function (ok) {
        console.log(ok);
    });

});

exports.consultarUsuarioQvo = functions.https.onRequest((req, res) => {
    // Grab the current value of what was written to the Realtime Database.
    const userQvo = req.query.userQvo;

    fetch('https://playground.qvo.cl/customers/' + userQvo, {
        headers: {
            'Authorization': 'Token ' + functions.config().qvo.token,
            'Content-Type': 'application/json'
        }
    }).then(function (res) {
        return res.json();
        console.log(res.json());
        console.log("NETRE AL RES");
    }).then(function (body) {
        console.log(body);
        res.status(200).send(body);
        return body
    }).then(function (ok) {
        console.log("ok");
    });
});


exports.detalleEvento = functions.https.onRequest((req, res) => {
   // const hours = (new Date().getHours() % 12) + 1 // london is UTC + 1hr;
    const eventId = req.query.eventId;

    console.log(res);

    return admin.database().ref(`/events/${eventId}`).once('value').then(snapshot => {
        const eventCapturado = snapshot.val();
        console.log(eventCapturado);

        res.status(200).send(`<!doctype html>
    <head>
     <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <title> ${eventCapturado.name}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="robots" content="index, follow">


    <meta property="og:site_name" content="${eventCapturado.name}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://izinait.com/bigben">
    <meta property="og:image" content="${eventCapturado.image}">
    <meta property="fb:app_id" content="1138664439526562">
    <meta property="og:description"
          content="${eventCapturado.name}"/>
    <meta property="og:title" content="${eventCapturado.name}"/>
    <link rel="canonical" href="https://izinait.com/bigben">
    <link rel="alternate" hreflang="x-default" href="https://izinait.com/bigben">
    </head>
    <body>
     
    </body>
  </html>`);
    });




});

/*
exports.crearUsuarioQvo = functions.database.ref('/userQvo/{userId}')
    .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        console.log(event.data.val());
        const data = event.data.val();


        fetch('https://playground.qvo.cl/customers', {
            method: 'POST',
            headers: {
                'Authorization': 'Token ' + functions.config().qvo.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: data.email
            })
        })
            .then(function (res) {
                return res.json();
                console.log(res.json());
                console.log("NETRE AL RES");
            }).then(function (body) {
            console.log(body);
            return admin.database().ref("/userQvo/" + data.uid + "/customer_id").set(body.id);

        }).then(function (ok) {
            console.log("ok");
        });
    }); */









/*
exports.addMessagess = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
// Push the new message into the Realtime Database using the Firebase Admin SDK.
    admin.database().ref('/messages').push({original: original}).then(snapshot => {
        // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
        res.redirect(303, snapshot.ref);
    });
}); */

/*

exports.agregarTarjeta = functions.database.ref('/userQvo/{userId}/tarjeta')
    .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        console.log(event.data.val());
        const data = event.data.val();


        fetch('https://playground.qvo.cl/customers/' + data.userQvo + '/cards/inscriptions', {
            method: 'POST',
            headers: {
                'Authorization': 'Token ' + functions.config().qvo.token,
                'Content-Type': 'application/x-www-form-urlencoded'

            },
            body: JSON.stringify({
                return_url: "https://izinait.com/app"
            })
        }).then(function (response) {
            console.log(response)
            return response.json();
        }).then(function (body) {
            console.log(body);
            return body;

        }).then(function (ok) {
            console.log(ok);
        });

    });
*/

/*
exports.addMessagess2 = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const idUser = req.query.idUser;

    fetch('https://playground.qvo.cl/customers/' + idUser + '/cards/inscriptions', {
        method: 'POST',
        headers: {
            'Authorization': 'Token ' + functions.config().qvo.token,
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            return_url: "http://izinait.com/app"
        })
    }).then(function (response) {
        console.log(response);
        console.log(response.json());
    });
// Push the new message into the Realtime Database using the Firebase Admin SDK.

}); */


exports.sendWelcomeEmail = functions.database.ref('/tickets/{eventId}/{userId}').onWrite(event => {
// [END onCreateTrigger]
    // [START eventAttributes]
    //const user = event.data; // The Firebase user.
    console.log(event.data.val());
    const datos = event.data.val();


    const email = datos.email; // The email of the user.
//const qrDato = datos.userId;
//var qr = qrProyect.image(qrDato, { type: 'png' });
//qr.pipe(require('fs').createWriteStream('qrCompra.png'));
//console.log(qr);

    const displayName = "andro ostoic"; // The display name of the user.
// [END eventAttributes]

    return sendWelcomeEmail(email, displayName);
});

/*
exports.makeUppercase = functions.database.ref('/messages/{pushId}/email')
    .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        console.log(event.data);
        const data = "andro.ostoic@gmail.com";

        fetch('https://playground.qvo.cl/customers', {
            method: 'POST',
            headers: {
                'Authorization': 'Token ' + functions.config().qvo.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: data
            })
        })
            .then(function (res) {
                return res.json();
                console.log(res.json());
            }).then(function (json) {
            console.log(json);
        });
    }); */


/*
exports.obtenerCliente = functions.database.ref('/messages/{pushId}/email2')
    .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        console.log(event.data);
        const data = "androstoic@gmail.com";

        fetch('https://playground.qvo.cl/customers/cus_kVf3XE91uyZOD_VV3LKNtA', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + functions.config().qvo.token
            }
        })
            .then(function (res) {
                console.log(res.json());
                return res.json();
            }).then(function (body) {
            console.log(body);
            return admin.database().ref(`/qvo_customers/${data.uid}/customer_id`).set(customer.id);
        });

    });

    */

/*

exports.obtenerClienteQvo = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const id = req.query.idQvo;
    fetch('https://playground.qvo.cl/customers/' + id, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + functions.config().qvo.token,
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        console.log(response);
    });

});

*/


//funciones !

function sendWelcomeEmail(email, displayName) {
    const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: email,
        html: '<b>Hello world ?</b>'
    };

    // The user subscribed to the newsletter.
    mailOptions.subject = `Welcome to ${APP_NAME}!`;
    mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`
    ;
    return mailTransport.sendMail(mailOptions).then(() => {
        console.log('New welcome email sent t1111111o:', email);
    });
};





