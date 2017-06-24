/**
 * Created by andro on 23-06-2017.
 */
'use strict';
angular.module('myApp.event', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/event', {
            templateUrl: 'event/event.html',
            controller: 'viewevent'
        });
    }])
    .controller('viewevent', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {

            var doorman = window.currentDoorman;
            var doormanLogeado = "";
            var rrppsCapturados = [];
            $scope.rrpps = [];



            var eventId = $routeParams.id; // id del evento entregador por url
            $scope.url = 'zxing://scan/?ret=http://'+location.host+'/reciveCode.html?code={CODE}';
            console.log(eventId);

            if (doorman != "") {
                var currentDay = new Date().getTime();
                var ref = firebase.database().ref('/doormans/').child(doorman.$id || doorman.uid);
                var doormanFB = $firebaseObject(ref);
                doormanFB.$loaded().then(function () {
                    doormanLogeado = doormanFB;
                    console.log(doormanLogeado);
                    console.log(window.currentDoorman + " ENTRE");
                });
            } else {
                console.log(window.currentDoorman + " NO ENTRE");
            }
            ;

        $scope.abrirLectorQr = function () {
            location.href = $scope.url;
        };


            var rrpps = $firebaseArray(firebase.database().ref('/rrpps/'));
            rrpps.$loaded().then(function () {
                rrppsCapturados = rrpps;
                console.log(rrppsCapturados);
                rrppsCapturados.forEach(function (x) {
                    console.log(x);
                    if(x.events != null){
                        $scope.eventsId = Object.keys(x.events);
                        $scope.eventsId.forEach(function (e) {
                            if(e == eventId){
                                $scope.rrpps.push(x);
                                console.log($scope.rrpps);
                            }
                        });
                    }

                });

            });


            $scope.AgregarPersonas = function (rrppSelect) {
                    $mdDialog.show({
                        controller: ControllerdialogAgregarPersonas,
                        templateUrl: 'dialogAgregarPersonas',
                        parent: angular.element(document.body),
                        clickOutsideToClose:true,
                        locals : {
                            rrppSelect : rrppSelect,
                        }
                    });


            };
            function ControllerdialogAgregarPersonas($scope, $mdDialog,$timeout, $q, $log, rrppSelect) {
                $scope.rrppSelect = rrppSelect;
                console.log($scope.rrppSelect);





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



