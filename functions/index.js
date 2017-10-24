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


var qvoJs = require('./qvo/functions.js');


admin.initializeApp(functions.config().firebase);

var fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});

var qrProyect = require('qr-image');

var QRCode = require('qrcode');

var promise = require('request-promise');
var MP = require("mercadopago");

const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);


// firebase functions:config:set gmail.password=<YOUR STRIPE API KEY>

const mailTransport = nodemailer.createTransport(`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);
const APP_NAME = 'izinait';


exports.createUserQvo = functions.https.onRequest((req, res) => {
    const email = req.query.email;
    const name = req.query.name;

    fetch('https://playground.qvo.cl/customers', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + functions.config().qvo.token,
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
        //console.log(body);
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
            'Authorization': 'Bearer ' + functions.config().qvo.token,
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            return_url: "https://izinait.com/app#!/codigo"
        })
    }).then(function (response) {
        //console.log(response)
        return response.json();
    }).then(function (body) {
        //console.log(body);
        //console.log(res);
        res.setHeader('Access-Control-Allow-Origin', 'https://izinait.com');
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
            'Authorization': 'Bearer ' + functions.config().qvo.token,
            'Content-Type': 'application/json'

        }
    }).then(function (response) {
        //console.log(response)
        return response.json();
    }).then(function (body) {
        //console.log(body);
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
            'Authorization': 'Bearer ' + functions.config().qvo.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: cobroTotal,
            description : "hola"
        })
    }).then(function (response) {
        //console.log(response)
        return response.json();
    }).then(function (body) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        //console.log(body);
        res.status(200).send(body);
        return body;

    }).then(function (ok) {
        //console.log(ok);
    });

});
exports.ComprobarCompraConWebPayPlus = functions.https.onRequest((req, res) => {
    // ...
    const userId = req.query.userId;
    const ticketId = req.query.ticketId;
    const eventId = req.query.eventId;
    const transaction_id= req.query.transaction_id;

    fetch('https://playground.qvo.cl/transactions/'+transaction_id, {
        headers: {
            'Authorization': 'Bearer ' + functions.config().qvo.token,
            'Content-Type': 'application/json'
        }
    }).then(function(response) {
        //console.log(response);
        return response.json();
    }).then(function (body) {

        res.setHeader('Access-Control-Allow-Origin', '*');
        if(body.status == 'successful')
        {
            //console.log(body);

            admin.database().ref("/userQvo/" + userId + "/charges/"+body.id).set(body);
            admin.database().ref("/tickets/" + eventId +"/"+ticketId).update({
                idTransaccion : body.id,
                paidOut : true
            });
            res.redirect(303, "https://www.izinait.com/app/#!/tickets?transaccionRealizada=true");
        }else{
            res.redirect(303, "https://www.izinait.com/app/#!/tickets?transaccionRealizada=false");

            admin.database().ref("/tickets/" + eventId +"/"+ticketId).set(null);
            admin.database().ref("/users/" + userId +"/tickets/"+ticketId).set(null);
        }





    });




});
exports.cobrarConWebPayPlus = functions.https.onRequest((req, res) => {
    // Grab the current value of what was written to the Realtime Database.
    const userQvo = req.query.userQvo;
    const url = "";
    const cobroTotal = req.query.cobroTotal;
    const userId = req.query.userId;
    const ticketId = req.query.ticketId;
    const eventId = req.query.eventId;

    fetch('https://playground.qvo.cl/webpay_plus/charge', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + functions.config().qvo.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: cobroTotal,
            return_url: "http://www.izinait.com/ComprobarCompraConWebPayPlus?userId="+userId+"&eventId="+eventId+"&ticketId="+ticketId,
            customer_id: req.query.userQvo

        })
    }).then(function (response) {
        //console.log(response)
        return response.json();
    }).then(function (body) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        //console.log(body);
        res.status(200).send(body);
        return body;
    }).then(function (ok) {
        //console.log(ok);
    });

});
exports.consultarUsuarioQvo = functions.https.onRequest((req, res) => {
    // Grab the current value of what was written to the Realtime Database.
    const userQvo = req.query.userQvo;

    fetch('https://playground.qvo.cl/customers/' + userQvo, {
        headers: {
            'Authorization': 'Bearer ' + functions.config().qvo.token,
            'Content-Type': 'application/json'
        }
    }).then(function (res) {
        return res.json();
        //console.log(res.json());
        //console.log("NETRE AL RES");
    }).then(function (body) {
        //console.log(body);
        res.status(200).send(body);
        return body
    }).then(function (ok) {
        //console.log("ok");
    });
});
exports.eliminarTarjetaQvo = functions.https.onRequest((req, res) => {
    // Grab the current value of what was written to the Realtime Database.
    const userQvo = req.query.userQvo;
    const tarjetaUserQvo = req.query.tarjetaUserQvo;

    fetch('https://playground.qvo.cl/customers/' + userQvo + '/cards/' + tarjetaUserQvo, {
        method : 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + functions.config().qvo.token,
        }

    }).then(function (res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.json();
        //console.log(res.json());
    }).then(function (body) {
        //console.log(body);

        res.status(200).send(body);
    });
});
exports.detalleEvento = functions.https.onRequest((req, res) => {
   // const hours = (new Date().getHours() % 12) + 1 // london is UTC + 1hr;
    const id = req.query.id;
    const friend = req.query.friend;


    var url = "";
    var urlTest = "";

    //console.log(id +" " + friend);


    return admin.database().ref(`/events/${id}`).once('value').then(snapshot => {
        const eventCapturado = snapshot.val();
        var rrppSelect = "";

        //console.log(eventCapturado);
        if(friend != undefined){
            admin.database().ref(`/rrpps/${friend}`).once('value').then(snapshot => {
                const rrppCapturado = snapshot.val();

                if(rrppCapturado.name == undefined){
                    rrppSelect = "izinait";
                    urlTest = "https://izinait.com/detalleEvento?id=" + id +"&friend=MD18DcCzYMXPhOQb8U61bWfgzRg2";
                    url = "https://izinait.com/app/#!/detalleEvento?id=" + id +"&friend=MD18DcCzYMXPhOQb8U61bWfgzRg2";

                    var title = eventCapturado.name + " | Invita: " + rrppSelect;
                    var description = (eventCapturado.eventDetails).toString();;

                    res.status(200).send(
                        `<!doctype html>
    <head>
     <meta http-equiv="content-type" content="text/html; charset=utf-8">
     
    <title> ${title}</title>
    
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="robots" content="index, follow">
    <meta name='keywords' content='fiesta, santiago, ${eventCapturado.musicGenres}'>
    <meta name='description' content='${description}'>
    <meta name='subject' content='your website's subject'>
    <meta name='copyright' content='IZINAIT '>
    <meta name='language' content='ES'>
    <meta name='Classification' content='eventos'>
    <meta name='author' content='izinait, contacto@izinait.com'>
    <meta name='url' content='${urlTest}'>
    <meta name='subtitle' content='This is my subtitle'>

    <meta property="og:site_name" content="${title}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${urlTest}">
    <meta property="og:image" itemprop="image"  content="${eventCapturado.image}">
    <meta property="og:image:type"  content="image/jpeg">
    <meta name="twitter:image:src" content="${eventCapturado.image}">
    <meta property="fb:app_id" content="1138664439526562">
    <meta property="og:description" content="${description}"/>
    <meta property="og:title" content="${title}"/>
    
    <link rel="canonical" href="${urlTest}">
    <link rel="alternate" hreflang="x-default" href="${urlTest}">
    
    <META HTTP-EQUIV="REFRESH" CONTENT="1;URL=${url}"> 
    </head>
    <body>
     <link itemprop="thumbnailUrl" href="${eventCapturado.image}"> 
      <span itemprop="thumbnail" itemscope itemtype="http://schema.org/ImageObject"> 
      <link itemprop="url" href="${eventCapturado.image}"> 
      </span>   
    <script>
    </body>
  </html>`

                    );

                }else{


                //console.log(rrppCapturado);
                rrppSelect = rrppCapturado.name;
                    urlTest = "https://izinait.com/detalleEvento?id=" + id +"&friend=" + rrppCapturado.uid;
                url = "https://izinait.com/app/#!/detalleEvento?id=" + id +"&friend=" + rrppCapturado.uid;

                var title = eventCapturado.name + " te invita " + rrppSelect;
                var description = (eventCapturado.eventDetails).toString();;

                res.status(200).send(
                    `<!doctype html>
    <head>
     <meta http-equiv="content-type" content="text/html; charset=utf-8">
     
    <title> ${title}</title>
    
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="robots" content="index, follow">
    <meta name='keywords' content='fiesta, santiago, ${eventCapturado.musicGenres}'>
    <meta name='description' content='${description}'>
    <meta name='subject' content='your website's subject'>
    <meta name='copyright' content='IZINAIT '>
    <meta name='language' content='ES'>
    <meta name='Classification' content='eventos'>
    <meta name='author' content='izinait, contacto@izinait.com'>
    <meta name='url' content='${urlTest}'>
    <meta name='subtitle' content='This is my subtitle'>

    <meta property="og:site_name" content="${title}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${urlTest}">
    <meta property="og:image" itemprop="image"  content="${eventCapturado.image}">
    <meta property="og:image:type"  content="image/jpeg">
    <meta name="twitter:image:src" content="${eventCapturado.image}">
    <meta property="fb:app_id" content="1138664439526562">
    <meta property="og:description" content="${description}"/>
    <meta property="og:title" content="${title}"/>
    
    <link rel="canonical" href="${urlTest}">
    <link rel="alternate" hreflang="x-default" href="${urlTest}">
    
    <META HTTP-EQUIV="REFRESH" CONTENT="1;URL=${url}"> 
    </head>
    <body>
     <link itemprop="thumbnailUrl" href="${eventCapturado.image}"> 
      <span itemprop="thumbnail" itemscope itemtype="http://schema.org/ImageObject"> 
      <link itemprop="url" href="${eventCapturado.image}"> 
      </span>   
    <script>
    </body>
  </html>`

                );   }

            });

        }
        else
            {
            rrppSelect = "izinait";
            urlTest = "https://izinait.com/detalleEvento?id=" + id +"&friend=MD18DcCzYMXPhOQb8U61bWfgzRg2";
            url = "https://izinait.com/app/#!/detalleEvento?id=" + id +"&friend=MD18DcCzYMXPhOQb8U61bWfgzRg2";

            var title = eventCapturado.name + "  invita " + rrppSelect;
            var description = (eventCapturado.eventDetails).toString();

            res.status(200).send(
                `<!doctype html>
    <head>
     <meta http-equiv="content-type" content="text/html; charset=utf-8">
     
    <title> ${title}</title>
    
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="robots" content="index, follow">
    <meta name='keywords' content='fiesta, santiago, ${eventCapturado.musicGenres}'>
    <meta name='description' content='${description}'>
    <meta name='subject' content='your website's subject'>
    <meta name='copyright' content='IZINAIT '>
    <meta name='language' content='ES'>
    <meta name='Classification' content='eventos'>
    <meta name='author' content='izinait, contacto@izinait.com'>
    <meta name='url' content='${urlTest}'>
    <meta name='subtitle' content='This is my subtitle'>

    <meta property="og:site_name" content="${title}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${urlTest}">
    <meta property="og:image" itemprop="image"  content="${eventCapturado.image}">
    <meta property="og:image:type"  content="image/jpeg">
    <meta name="twitter:image:src" content="${eventCapturado.image}">
    <meta property="fb:app_id" content="1138664439526562">
    <meta property="og:description" content="${description}"/>
    <meta property="og:title" content="${title}"/>
    
    <link rel="canonical" href="${urlTest}">
    <link rel="alternate" hreflang="x-default" href="${urlTest}">
    
    <META HTTP-EQUIV="REFRESH" CONTENT="1;URL=${url}"> 
    </head>
    <body>
     <link itemprop="thumbnailUrl" href="${eventCapturado.image}"> 
      <span itemprop="thumbnail" itemscope itemtype="http://schema.org/ImageObject"> 
      <link itemprop="url" href="${eventCapturado.image}"> 
      </span>   
    <script>
    </body>
  </html>`

            );
        };









    });




});

/*
exports.crearUsuarioQvo = functions.database.ref('/userQvo/{userId}')
    .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        //console.log(event.data.val());
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
                //console.log(res.json());
                //console.log("NETRE AL RES");
            }).then(function (body) {
            //console.log(body);
            return admin.database().ref("/userQvo/" + data.uid + "/customer_id").set(body.id);

        }).then(function (ok) {
            //console.log("ok");
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
        //console.log(event.data.val());
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
            //console.log(response)
            return response.json();
        }).then(function (body) {
            //console.log(body);
            return body;

        }).then(function (ok) {
            //console.log(ok);
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
        //console.log(response);
        //console.log(response.json());
    });
// Push the new message into the Realtime Database using the Firebase Admin SDK.

}); */


exports.correoCortecia = functions.database.ref('/events/{eventId}/list/{usersId}').onWrite(event => {
    // enviar correo de cortecia con link
    // https://www.izinait.com/qrUsuario.html?id=IDUSUARIOCONLASCORTECIA

});

exports.correoCompraTicket = functions.database.ref('/tickets/{eventId}/{userId}').onWrite(event => {

    //console.log(event.data.val());
    const datos = event.data.val();
    const email = datos.email;
    const displayName = "andro ostoic";
   return sendWelcomeEmail(datos);
});

exports.sendWelcomeEmail = functions.database.ref('/users/{users}').onWrite(event => {
// [END onCreateTrigger]
    // [START eventAttributes]
    //const user = event.data; // The Firebase user.
    const datosAntiguos = event.data._data;
    const datosNuevos = event.data._newData;
    const datos = event.data.val();

    if(event.data._data.email != event.data._newData.email){
            if(event.data._newData.email != 'null@izinait.com'){
                if(event.data._data.email == 'null@izinait.com'){
                    sendWelcome(datos);
                }

            }
    }

    //console.log(event.data.val());
    //console.log(event.data);
    //console.log(event);


    //if(email != 'null@izinait.com'){
      //  sendWelcome(email);
    //}



    //return sendWelcome(datos);
});

/*
exports.makeUppercase = functions.database.ref('/messages/{pushId}/email')
    .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        //console.log(event.data);
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
                //console.log(res.json());
            }).then(function (json) {
            //console.log(json);
        });
    }); */


/*
exports.obtenerCliente = functions.database.ref('/messages/{pushId}/email2')
    .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        //console.log(event.data);
        const data = "androstoic@gmail.com";

        fetch('https://playground.qvo.cl/customers/cus_kVf3XE91uyZOD_VV3LKNtA', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + functions.config().qvo.token
            }
        })
            .then(function (res) {
                //console.log(res.json());
                return res.json();
            }).then(function (body) {
            //console.log(body);
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
        //console.log(response);
    });

});

*/


//funciones !

function sendWelcomeEmail(datos) {
    const datosCapturados = datos;
    var linkFoto = "";
    var nombreClub = "";
    var nombreEvento ="";
    var eventCapturado;
    var clubCapturado;
    var direccionClub ="";
    var linkQr;
    //console.log(datos.userId);

   admin.database().ref(`/events/${datos.eventId}`).once('value').then(snapshot => {
       eventCapturado = snapshot.val();
        linkFoto = eventCapturado.image;
        nombreEvento = eventCapturado.name;
        //console.log(eventCapturado);

       var utcSeconds = datos.date;
       var fechaCompraInicial = new Date(0); // The 0 there is the key, which sets the date to the epoch
       var fechaCompra = fechaCompraInicial.setUTCSeconds(utcSeconds);



       var opts = {
           errorCorrectionLevel: 'H',
           type: 'image/jpeg',
           rendererOpts: {
               quality: 0.3
           }
       }


       admin.database().ref(`/clubs/${Object.keys(eventCapturado.clubs)[0]}`).once('value').then(snapshot => {
           clubCapturado = snapshot.val();

           nombreClub = clubCapturado.name;
           direccionClub = clubCapturado.address;


           QRCode.toDataURL(datos.userId, opts, function (err, url) {
               if (err) throw err

               linkQr = url;
               //console.log(linkQr);




                   const mailOptions = {
                   from: `${APP_NAME} <noreply@firebase.com>`,
                   to: datos.email,
                   html: `
                   <!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title></title>
  <!--[if !mso]><!-- -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    .ReadMsgBody {
      width: 100%;
    }

    .ExternalClass {
      width: 100%;
    }

    .ExternalClass * {
      line-height: 100%;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }
  </style>
  <!--[if !mso]><!-->
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport {
        width: 320px;
      }
      @viewport {
        width: 320px;
      }
    }
  </style>
  <!--<![endif]-->
  <!--[if mso]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <!--[if lte mso 11]>
<style type="text/css">
  .outlook-group-fix {
    width:100% !important;
  }
</style>
<![endif]-->

  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 {
        width: 100%!important;
      }
      .mj-column-px-600 {
        width: 600px!important;
      }
      .mj-column-px-300 {
        width: 300px!important;
      }
    }
  </style>
</head>

<body>

  <div class="mj-container">
    <!--[if mso | IE]>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
        <tr>
          <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->
    <div style="margin:0px auto;max-width:600px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;" align="center" border="0">
        <tbody>
          <tr>
            <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;">
              <!--[if mso | IE]>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;width:600px;">
      <![endif]-->
              <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr>
                      <td style="word-wrap:break-word;font-size:0px;padding:20px 0px;">
                        <div style="margin:0px auto;max-width:600px;background:#1b001b;" data-class="">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#1b001b;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;">
                                  <!--[if mso | IE]>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;width:600px;">
      <![endif]-->
                                  <div class="mj-column-px-600 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                      <tbody>
                                        <tr>
                                          <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
                                            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                                              <tbody>
                                                <tr>
                                                  <td style="width:50px;"><img alt="" title="" height="auto" src="https://izinait.com/app/logo.png" style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="50"></td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
                                            <div style="cursor:auto;color:#fff;font-family:Helvetica Neue;font-size:30px;line-height:22px;text-align:center;">izinait</div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
                                            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0">
                                              <tbody>
                                                <tr>
                                                  <td style="border:none;border-radius:3px;color:#ffffff;cursor:auto;padding:10px 25px;" align="center" valign="middle" bgcolor="#fe0072"><a href="https://izinait.com/app/#!/codigo" style="text-decoration:none;background:#fe0072;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;text-transform:none;margin:0px;"
                                                      target="_blank">VE TU CODIGO QR</a></td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="left">
                                            <div style="cursor:auto;color:white;font-family:helvetica;font-size:13px;line-height:22px;text-align:left;">Gracias ${datos.displayName} por comprar en izinait</div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="left">
                                            <div style="cursor:auto;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:11px;line-height:22px;text-align:left;">Acabas de realizar una compra para el evento "${nombreEvento}", con un valor de $ ${datos.totalAPagar} , recuerda que con tu codigo QR podras acceder de manera rapida y sencilla.</div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
                                            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                                              <tbody>
                                                <tr>
                                                  <td style="width:500px;"><img alt="" title="" height="auto" src="${linkFoto}"
                                                      style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="500"></td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="word-wrap:break-word;font-size:0px;" align="center">
                                            <div class="mj-column-px-300 outlook-group-fix" data-vertical-align="top" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                                              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                  <tr>
                                                    <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="left">
                                                      <div style="cursor:auto;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:9px;line-height:22px;text-align:left;">Nombre Evento : ${nombreEvento} <br> Club Evento : ${nombreClub} <br> Dirección Club : ${direccionClub}<br> Fecha de compra: ${fechaCompra} <br> Código Transacción: ${datos.idTransaccion} <br> Correo
                                                        del comprador : ${datos.email} <br> Metodo de pago : OneClick</div>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
                                            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                                              <tbody>
                                                <tr>
                                                  <td style="width:300px;"><img alt="" title="" height="auto" src="src="data:image/png;base64,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" style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="300"></td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
                                            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0">
                                              <tbody>
                                                <tr>
                                                  <td style="border:none;border-radius:3px;color:#ffffff;cursor:auto;padding:10px 25px;" align="center" valign="middle" bgcolor="#fe0072"><a href="https://izinait.com/app/#!/codigo" style="text-decoration:none;background:#fe0072;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;text-transform:none;margin:0px;"
                                                      target="_blank">ACA PODRAS VER TUS TICKETS</a></td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <!--[if mso | IE]>
      </td></tr></table>
      <![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]>
      </td></tr></table>
      <![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]>
      </td></tr></table>
      <![endif]-->
  </div>
</body>

</html>
               `
               };

               // The user subscribed to the newsletter.
               mailOptions.subject = `Gracias por tu compra, ${APP_NAME}!`;
               mailOptions.text = ``;
               return mailTransport.sendMail(mailOptions).then(() => {
                   //console.log('New welcome email sent t1111111o:', datos.email);
               });
           });









       });





   });




};

function sendWelcome(datos){


    const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: datos.email,
        html: `
        <!doctype html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

        <head>
        <title></title>
        <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style type="text/css">
    #outlook a {
        padding: 0;
    }

.ReadMsgBody {
.ReadMsgBody {
        width: 100%;
    }

.ExternalClass {
        width: 100%;
    }

.ExternalClass * {
        line-height: 100%;
}

    body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
    }

    table,
        td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
    }

    img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
    }

    p {
        display: block;
        margin: 13px 0;
    }
</style>
    <!--[if !mso]><!-->
    <style type="text/css">
        @media only screen and (max-width:480px) {
    @-ms-viewport {
            width: 320px;
        }
        @viewport {
            width: 320px;
        }
    }
</style>
    <!--<![endif]-->
    <!--[if mso]>
<xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <!--[if lte mso 11]>
<style type="text/css">
.outlook-group-fix {
        width:100% !important;
    }
</style>
    <![endif]-->

    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
        <style type="text/css">
        @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
                        </style>
<!--<![endif]-->
    <style type="text/css">
        @media only screen and (min-width:480px) {
    .mj-column-per-100 {
            width: 100%!important;
        }
    .mj-column-px-300 {
            width: 300px!important;
        }
    }
</style>
    </head>

    <body>

    <div class="mj-container">
        <!--[if mso | IE]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
        <tr>
        <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
        <div style="margin:0px auto;max-width:600px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;" align="center" border="0">
        <tbody>
        <tr>
        <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;">
        <!--[if mso | IE]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
        <td style="vertical-align:top;width:600px;">
        <![endif]-->
        <div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
        <tr>
        <td style="word-wrap:break-word;font-size:0px;padding:20px 0px;">
        <div style="margin:0px auto;max-width:600px;background:#1b001b;" data-class="">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#1b001b;" align="center" border="0">
        <tbody>
        <tr>
        <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;">
        <!--[if mso | IE]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
        <td style="vertical-align:top;width:300px;">
        <![endif]-->
        <div class="mj-column-px-300 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
        <tr>
        <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
        <tbody>
        <tr>
        <td style="width:50px;"><img alt="" title="" height="auto" src="https://izinait.com/app/logo.png" style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:auto;" width="50"></td>
        </tr>
        </tbody>
        </table>
        </td>
        </tr>
        <tr>
        <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
        <div style="cursor:auto;color:#fff;font-family:Helvetica Neue;font-size:30px;line-height:22px;text-align:center;">izinait</div>
        </td>
        </tr>
        <tr>
        <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0">
        <tbody>
        <tr>
        <td style="border:none;border-radius:3px;color:#ffffff;cursor:auto;padding:10px 25px;" align="center" valign="middle" bgcolor="#fe0072"><a href="https://izinait.com/app/#!/codigo" style="text-decoration:none;background:#fe0072;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;text-transform:none;margin:0px;"
    target="_blank">BIENVENIDO A IZINAIT</a></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    <tr>
    <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="left">
        <div style="cursor:auto;color:white;font-family:helvetica;font-size:13px;line-height:22px;text-align:left;">Hola ${datos.displayName},<br><br> Te damos la bienvenida a izinait! La creación de tu cuenta en izinait mediante Facebook ha sido exitosa y ya puedes comenzar a disfrutar de los contenidos exclusivos de nuestra
    plataforma.</div>
    </td>
    </tr>
    <tr>
    <td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0">
        <tbody>
        <tr>
        <td style="border:none;border-radius:3px;color:#ffffff;cursor:auto;padding:10px 25px;" align="center" valign="middle" bgcolor="#fe0072"><a href="https://izinait.com/app/#!/codigo" style="text-decoration:none;background:#fe0072;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;text-transform:none;margin:0px;"
    target="_blank">VER EVENTOS Y SERVICIOS</a></td>
    </tr>
    </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    <!--[if mso | IE]>
</td></tr></table>
    <![endif]-->
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    <!--[if mso | IE]>
</td></tr></table>
    <![endif]-->
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    <!--[if mso | IE]>
</td></tr></table>
    <![endif]-->
    </div>
    </body>

    </html>
                 
               `
    };

    // The user subscribed to the newsletter.
    mailOptions.subject = `Bienvenido a izinait!`;
    mailOptions.text = ``;
    return mailTransport.sendMail(mailOptions).then(() => {
        //console.log('nuevo usuario registrado :', datos.email);
    });




    exports.prueba = function(){
        //console.log(prueba);
    }

};





