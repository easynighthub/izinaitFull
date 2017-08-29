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




admin.initializeApp(functions.config().firebase);

var fetch = require('node-fetch');
const nodemailer = require('nodemailer');
var qrProyect = require('qr-image');
var promise = require('request-promise');


const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);

const mailTransport = nodemailer.createTransport(`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);

// Your company name to include in the emails
// TODO: Change this to your app or company name to customize the email sent.
const APP_NAME = 'IZINAIT';


exports.crearUsuarioQvo = functions.database.ref('/userQvo/{userId}')
        .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        console.log(event.data.val());
        const data = event.data.val();


fetch('https://playground.qvo.cl/customers', {
    method: 'POST',
    headers: {
        'Authorization': 'Token '+functions.config().qvo.token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: data.email
    })
})
    .then(function(res) {
        return res.json();
        console.log(res.json());
        console.log("NETRE AL RES");
    }).then(function(body) {
    console.log(body);
    return admin.database().ref("/userQvo/"+data.uid+"/customer_id").set(body.id);

}).then(function (ok) {
    console.log("ok");
});
});



exports.agregarTarjeta = functions.database.ref('/userQvo/{userId}/tarjeta')
        .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        console.log(event.data.val());
        const data = event.data.val();


fetch('https://playground.qvo.cl/customers/'+data.userQvo+'/cards/inscriptions', {
    method: 'POST',
    headers: {
        'Authorization': 'Token '+functions.config().qvo.token,
        'Content-Type': 'application/x-www-form-urlencoded'

    },
    body: JSON.stringify({
        return_url: "http://izinait.com/app"
    })
}).then(function(response) {
    console.log(response)
});

});



$scope.boleta = [];
$scope.ordenes.forEach(function (x) {

   $scope.boleta.push(x.idBoletaComun);


});




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






exports.makeUppercase = functions.database.ref('/messages/{pushId}/email')
        .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        console.log(event.data);
        const data = "andro.ostoic@gmail.com";

  fetch('https://playground.qvo.cl/customers', {
    method: 'POST',
    headers: {
        'Authorization': 'Token '+functions.config().qvo.token,
        'Content-Type': 'application/json'
    },
      body: JSON.stringify({
          email: data
      })
    })
    .then(function(res) {
        return res.json();
        console.log(res.json());
    }).then(function(json) {
    console.log(json);
});
});


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
    .then(function(res) {
        console.log(res.json());
        return res.json();
    }).then(function(body) {
    console.log(body);
    return admin.database().ref(`/qvo_customers/${data.uid}/customer_id`).set(customer.id);
});

});





//funciones !

function sendWelcomeEmail(email, displayName) {
    const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: email
    };

    // The user subscribed to the newsletter.
    mailOptions.subject = `Welcome to ${APP_NAME}!`;
    mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our service.`
    ;
    return mailTransport.sendMail(mailOptions).then(() => {
            console.log('New welcome email sent t1111111o:', email);
});
}


/*
exports.makeUppercase = functions.database.ref('/messages/{pushId}/email')
        .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        console.log(event.data);

fetch('https://playground.qvo.cl/customers', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer '+functions.config().qvo.token
    }
}, {
    email: "androstoic@gmail.com",
    name: "Tyrion Lannister"
})
    .then(function(res) {
        return res.json();
        console.log(res.json());
    }).then(function(body) {
    console.log(body);
});

});
 */


// Using Express



