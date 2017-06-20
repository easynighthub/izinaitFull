'use strict';
angular.module('myApp.detalleEvento', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/detalleEvento', {
            templateUrl: 'detalleEvento/detalleEvento.html',
            controller: 'viewdetalleEvento'
        });
    }])
    .controller('viewdetalleEvento', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope) {

            var user = window.currentApp;
            $scope.usuarioLogeado = "";

            if (user != "") {
                var ref = firebase.database().ref('/users/').child(user.uid);
                var usersLocal = $firebaseObject(ref);
                usersLocal.$loaded().then(function () {
                    $scope.usuarioLogeado = usersLocal;
                    console.log( $scope.usuarioLogeado);
                    $('.nombreUsuario').text( $scope.usuarioLogeado.displayName);
                    //  $('.user-header .imagen').text(usersLocal.picture);
                    $('.codigoAcceder').text("Tú Codigo");
                    console.log(window.currentApp + " ENTRE");
                });
            } else {
                $('.nombreUsuario').text("BIENVENIDO");
                $('.codigoAcceder').text("acceder");
                console.log(window.currentApp + " NO ENTRE");
            };

            var eventId = $routeParams.id; // id del evento entregador por url
            var friendId = $routeParams.friend; // id del rrpp o amigo que compartio el evento
            var Rrpp = friendId || 'MD18DcCzYMXPhOQb8U61bWfgzRg2'; //rrpp selecionado

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


            var buscarme = firebase.database().ref('/asist/' + eventId);
            var buscarmeRequest = $firebaseArray(buscarme);
            buscarmeRequest.$loaded().then(function () {
                $scope.todosLosDatos = buscarmeRequest;
                $scope.rrpps = $scope.todosLosDatos;
                console.log($scope.rrpps);
                if (user != "") {
                    buscarme.once("value").then(function (snapshot) {
                        $scope.rrpps.forEach(function (data) {
                            var c = snapshot.child(data.$id + '/' + user.uid).exists(); // true
                            if (c === true) {
                                var Rrpp = data.$id;
                                var totalAsist = firebase.database().ref('/asist/' + eventId + '/' + Rrpp + '/' + user.uid);
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
                }
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
                firebase.database().ref('asist/' + eventId + '/' + Rrpp + '/' + user.uid).update($scope.nuevaAsistencia);
                document.getElementById('botonAsistir').style.display = 'none';
                document.getElementById('selectLista').style.display = 'none';
                document.getElementById('botonLista').style.display = 'block';
                $scope.datosAsistire = {};
                $scope.datosAsistire.totalList = total;

            }




        }]);



