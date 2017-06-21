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

            if (user != "") {
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
                $('.nombreUsuario').text("BIENVENIDO");
                $('.codigoAcceder').text("acceder");
                console.log(window.currentApp + " NO ENTRE");
            };



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
                $mdDialog.show({
                    controller: DialogControllerAceptarReserva,
                    templateUrl: 'dialogAceptarReserva',
                    parent: angular.element(document.body),
                    clickOutsideToClose:true,
                    locals : {
                        eventsService : eventsService,
                    }
                })

            };
            function DialogControllerAceptarReserva($scope, $mdDialog,$timeout, $q, $log, eventsService) {
                var eventsService = eventsService;
                    console.log(usuarioLogeado);
                    $scope.usuarioLogeado =usuarioLogeado;


                $scope.Adquirir = function (descripcionAnular) {

                    $mdDialog.hide();
                }

                $scope.hide = function() {
                    $mdDialog.hide();
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();

                };

            }




        }]);



