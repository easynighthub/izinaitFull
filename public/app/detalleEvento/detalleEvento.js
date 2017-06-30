'use strict';
angular.module('myApp.detalleEvento', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/detalleEvento', {
            templateUrl: 'detalleEvento/detalleEvento.html',
            controller: 'viewdetalleEvento'
        });
    }])
    .controller('viewdetalleEvento', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {

            var user = window.currentApp;
            var usuarioLogeado = "";

            var eventId = $routeParams.id; // id del evento entregador por url
            var friendId = $routeParams.friend; // id del rrpp o amigo que compartio el evento
            var Rrpp = friendId || 'MD18DcCzYMXPhOQb8U61bWfgzRg2'; //rrpp selecionado

            firebase.database().ref('users/').child(user.$id || user.uid).once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/users/').child( user.$id || user.uid);
                    var usersLocal = $firebaseObject(ref);
                    var buscarme = firebase.database().ref('/asist/' + eventId);
                    var buscarmeRequest = $firebaseArray(buscarme);

                    usersLocal.$loaded().then(function () {
                        usuarioLogeado = usersLocal;
                        console.log(usuarioLogeado);
                        $('.nombreUsuario').text( usuarioLogeado.displayName);
                        //  $('.user-header .imagen').text(usersLocal.picture);
                        $('.codigoAcceder').text("Tú Codigo");
                        console.log(window.currentApp + " ENTRE");

                        buscarmeRequest.$loaded().then(function () {
                            $scope.todosLosDatos = buscarmeRequest;
                            $scope.rrpps = $scope.todosLosDatos;
                            console.log($scope.rrpps);
                            buscarme.once("value").then(function (snapshot) {
                                $scope.rrpps.forEach(function (data) {
                                    var c = snapshot.child(data.$id + '/' + usuarioLogeado.$id).exists(); // true
                                    if (c === true) {
                                        var Rrpp = data.$id;
                                        var totalAsist = firebase.database().ref('/asist/' + eventId + '/' + Rrpp + '/' + usuarioLogeado.$id);
                                        var totalAsistRrequest = $firebaseObject(totalAsist);
                                        totalAsistRrequest.$loaded().then(function () {
                                            $scope.datosAsistire = totalAsistRrequest;
                                            $scope.siExisto = +1
                                            if ($scope.siExisto > 0) {
                                                document.getElementById('botonAsistir').style.display = 'none';
                                                document.getElementById('selectLista').style.display = 'none';
                                                document.getElementById('botonLista').style.display = 'block';
                                            }
                                        });
                                    };
                                });
                            });

                        });
                    });
                } else {
                    window.currentApp = "";
                    $scope.usuarioLogeado = "";
                    $('.nombreUsuario').text("BIENVENIDO");
                    $('.codigoAcceder').text("acceder");
                    console.log(window.currentApp + " NO ENTRE");
                };
            });





            // capturar datos de firebase
            var clubsER = $firebaseArray(firebase.database().ref().child('clubs'));


            var getEvent = $firebaseObject(firebase.database().ref().child('events/' + eventId));
            getEvent.$loaded().then(function () {
                console.log(getEvent);
                $scope.event = getEvent;
                document.getElementById('BarraCargando').style.display = 'none';
                document.getElementById('detalleEvento').style.display = 'block';
            });




            //funciones
            $scope.getClub = function (club) {
                if (club) {
                    var clubKey = Object.keys(club)[0];
                    return $filter('filter')(clubsER, {$id: clubKey})[0].name;
                }
            };
            $scope.getDireccionClub = function (club) {
                if (club) {
                    var clubKey = Object.keys(club)[0];
                    return $filter('filter')(clubsER, {$id: clubKey})[0].address;
                }
            };


            // guardar impreciones de un amigo o de un rrpp que compartio izinait o simplemente de izinait
            var impresionesContador = firebase.database().ref('/impresiones/' + eventId + '/' + Rrpp + '/openLink');
            var impresionesContadorRQ = $firebaseObject(impresionesContador);
            impresionesContadorRQ.$loaded().then(function () {
                $scope.contadorTotal = impresionesContadorRQ;
                // console.log($scope.contadorTotal.$value);
                $scope.contadorTotal.$value++;
                //console.log($scope.contadorTotal.$value);
                var impresionesRRPP = firebase.database().ref('/impresiones/' + eventId + '/' + Rrpp + '/').update({
                    openLink: $scope.contadorTotal.$value
                });

            });





            $scope.editarListaGratis = function () {
                document.getElementById('botonAsistir').style.display = 'block';
                document.getElementById('selectLista').style.display = 'block';
                document.getElementById('botonLista').style.display = 'none';
            };

            $scope.guardarListaGratis = function () {
                $scope.nuevaAsistencia ={};
                $scope.nuevaAsistencia.asistencia = false;
                $scope.nuevaAsistencia.fechaClick = Date.now();
                $scope.nuevaAsistencia.totalList = $scope.totalReserva;
                var totalAsistenciaVisible = $scope.totalReserva;
                if(user != ""){
                    guardarListaGratisFuncion(totalAsistenciaVisible);
                }else
                    {
                        alert("DEBES INICIAR SESION");
                    }


            };

            function guardarListaGratisFuncion(total) {
                firebase.database().ref('asist/' + eventId + '/' + Rrpp + '/' + usuarioLogeado.$id).update($scope.nuevaAsistencia);
                document.getElementById('botonAsistir').style.display = 'none';
                document.getElementById('selectLista').style.display = 'none';
                document.getElementById('botonLista').style.display = 'block';
                $scope.datosAsistire = {};
                $scope.datosAsistire.totalList = total;

            }

            var serviciosCapturados = firebase.database().ref('/eventServices/').child(eventId);
            var objDeServicios = $firebaseObject(serviciosCapturados);
            objDeServicios.$loaded().then(function () {
                var eventServices = [];
                angular.forEach(objDeServicios, function (value, key) {
                    console.log(key);
                    value.id = key;
                    eventServices.push(value);
                });

                $scope.allEventsService = eventServices; //obj;
                console.log($scope.allEventsService);
            });


            $scope.dialogAdquirirServicio = function (eventsService) {
                if(usuarioLogeado == ""){
                    $mdDialog.show({
                        controller: dialogControllerAccederConFacebook,
                        templateUrl: 'dialogAccederConFacebook',
                        parent: angular.element(document.body),
                        clickOutsideToClose:true,
                        locals : {
                            eventsService : eventsService,
                        }
                    });
                }else
                {
                    $mdDialog.show({
                        controller: dialogControllerAdquirirServicio,
                        templateUrl: 'dialogAdquirirServicio',
                        parent: angular.element(document.body),
                        clickOutsideToClose:true,
                        locals : {
                            eventsService : eventsService,
                        }
                    });

                }


            };
            function dialogControllerAccederConFacebook($scope, $mdDialog,$timeout, $q, $log, eventsService) {
                var eventsService = eventsService;
                var token;
                    $scope.usuarioLogeado =usuarioLogeado;

                $scope.IngresarConFacebook =  function() {

                    var USERS_LOCATION = 'users/';
                    var database = firebase.database();
                    var provider = new firebase.auth.FacebookAuthProvider();


                    //se agrega el permiso de cumpleaños
                    provider.addScope('user_birthday');
                    provider.addScope('email');
                    provider.addScope('public_profile');


                    firebase.auth().signInWithPopup(provider).then(function(result) {

                        // This gives you a Google Access Token. You can use it to access the Google API.
                        token = result.credential.accessToken;
                        // The signed-in user info.
                        user = result.user;
                        console.log(token);
                        console.log(user);
                        firebase.auth().onAuthStateChanged(onAuthStateChanged);
                    }).catch(function(error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // The email of the user's account used.
                        var email = error.email;
                        // The firebase.auth.AuthCredential type that was used.
                        var credential = error.credential;
                    });

                    function    writeUserData(response) {
                        database
                            .ref(USERS_LOCATION + user.uid)
                            .update({
                                displayName: response.name,
                                email: response.email || "null@izinait.com",
                                picture: response.picture.data.url,
                                provider: provider,
                                type: 'Free',
                                age: response.age_range.min,
                                birthday: response.birthday || "11/11/1111",
                                firstName: response.first_name,
                                facebookId: response.id,
                                lastName: response.last_name,
                                gender : response.gender
                            });
                    }

                    function onAuthStateChanged(user) {
                        //cleanupUi();
                        if (user) {
                            FB.api('/me', 'get',
                                {
                                    access_token: token,
                                    fields: 'id, name, email, first_name, last_name, age_range{min}, picture.type(large), birthday, gender'
                                },
                                function(response) {
                                    checkIfUserExists(user.uid, response);
                                });
                        } else {
                            // Display the splash page where you can sign-in.
                        }
                    }

                    function userExistsCallback(exists, response) {
                        if (exists) {

                            writeUserData(response);
                            console.log(response);
                            console.log("obtuve el codigo");


                            $scope.nombre = firebase.auth().currentUser.displayName;

                            var ref = firebase.database().ref('/users/').child(user.uid);
                            var usersLocal = $firebaseObject(ref);
                            usersLocal.$loaded().then(function(){
                                window.currentApp = usersLocal;
                                $scope.usuarioLogeado = usersLocal;

                                $scope.nombre = $scope.usuarioLogeado.displayName;
                                $scope.email = $scope.usuarioLogeado.email;
                                $scope.foto = $scope.usuarioLogeado.picture;
                                $scope.email = $scope.usuarioLogeado.email;

                                $('.nombreUsuario').text( $scope.usuarioLogeado.displayName);
                                $('.codigoAcceder').text("Tú Codigo");
                                console.log("obvtuve la foto y el correo");
                                $mdDialog.hide();


                            });



                        } else {
                            writeUserData(response);
                            console.log(firebase.auth().currentUser);
                             // obtengo codigo

                            $scope.nombre = firebase.auth().currentUser.displayName;

                            var ref = firebase.database().ref('/users/').child(user.uid);
                            var usersLocal = $firebaseObject(ref);
                            usersLocal.$loaded().then(function(){
                                window.currentApp = usersLocal;
                                $scope.usuarioLogeado = usersLocal;
                                $scope.nombre = $scope.usuarioLogeado.displayName;
                                $scope.email = $scope.usuarioLogeado.email;
                                $scope.foto = $scope.usuarioLogeado.picture;
                                $scope.email = $scope.usuarioLogeado.email;
                                $('.nombreUsuario').text( $scope.usuarioLogeado.displayName);
                                $('.codigoAcceder').text("Tú Codigo");
                                console.log("obvtuve la foto y el correo");
                                $mdDialog.hide();


                            });
                        }
                    }

                    // Tests to see if /users/<userId> has any data.
                    function checkIfUserExists(userId, response) {
                        var usersRef = database.ref(USERS_LOCATION);
                        usersRef.child(userId).once('value', function(snapshot) {
                            var exists = (snapshot.val() !== null);
                            console.log(exists);
                            userExistsCallback(exists, response);
                        });
                    }
                };


                $scope.hide = function() {
                    $mdDialog.hide();
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();

            };


                window.fbAsyncInit = function() {
                    FB.init({
                        appId      : '1138664439526562',
                        xfbml      : true,
                        version    : 'v2.8'
                    });
                    FB.AppEvents.logPageView();
                };

                (function(d, s, id){
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {return;}
                    js = d.createElement(s); js.id = id;
                    js.src = "//connect.facebook.net/es_LA/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));



            };

            function dialogControllerAdquirirServicio($scope, $mdDialog,$timeout, $q, $log, eventsService) {
                $scope.eventsService = eventsService;
                console.log(eventsService);
                $scope.usuarioLogeado =usuarioLogeado;
                 console.log($scope.usuarioLogeado);
                $scope.maxEntradas = [];
                $scope.newTicket = [];
                $scope.cantidadDeCompra;
                $scope.celular;


                if($scope.usuarioLogeado.celular){
                    $scope.celular = $scope.usuarioLogeado.celular;
                }

                for (var i = 1; i <= $scope.eventsService.maxEntradas; i++) {
                    var entradas = {
                        id: i,
                        name: i
                    };
                    $scope.maxEntradas.push(entradas);
                    //console.log("Entradas", $scope.maxEntradas)
                };

                $scope.adquirir = function (cantidadDeCompra,celular) {
                    console.log(celular);
                    $scope.newTicket.email =  $scope.usuarioLogeado.email;
                    $scope.newTicket.ideventservices =  $scope.eventsService.id; // !!!!!! falta rescatar el id de la fila selecionada "del servicio a comprar"
                    $scope.newTicket.lastName =  $scope.usuarioLogeado.lastName; //$scope.datosTicket.lastName;
                    $scope.newTicket.firstName =  $scope.usuarioLogeado.firstName; //$scope.datosTicket.firstName;
                    $scope.newTicket.celular =  celular;
                    $scope.newTicket.date = new Date().getTime();
                    $scope.newTicket.paidOut = false; //devolver pago
                    $scope.newTicket.rrppid = Rrpp;
                    $scope.newTicket.totalAPagar = $scope.eventsService.precio *  cantidadDeCompra;
                    $scope.newTicket.eventId = eventId;
                    $scope.newTicket.userId = $scope.usuarioLogeado.$id;
                    $scope.newTicket.ticketId = firebase.database().ref().child('ticketsCreate/').push().key;


                    firebase.database().ref('tickets/' + eventId + '/' + $scope.usuarioLogeado.$id + '/' + $scope.newTicket.ticketId).set($scope.newTicket).then(
                        function (s) {
                            console.log('se guardaron bien el tickets ');
                            firebase.database().ref('ticketsCreate/' + $scope.newTicket.ticketId).set(true);

                            firebase.database().ref('users/' + $scope.usuarioLogeado.$id + '/events/' + eventId).set(true);
                               firebase.database().ref('users/' + $scope.usuarioLogeado.$id).update(
                                   {celular: $scope.newTicket.celular});
                            $mdDialog.hide();
                        }, function (e) {
                            alert('Error, intente de nuevo');
                            // console.log('se guardo mal ', e);
                        }
                    );


                };



                $scope.hide = function() {
                    $mdDialog.hide();
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();

                };


            };






        }]);



