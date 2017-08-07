/**
 * Created by andro on 03-08-2017.
 */

/**
 * Created by andro on 23-06-2017.
 */
'use strict';
angular.module('myApp.puerta', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/puerta', {
            templateUrl: 'puerta/puerta.html',
            controller: 'viewpuerta'
        });
    }])
    .controller('viewpuerta', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {

            var doorman = window.currentDoorman;
            var doormanLogeado = "";
            var rrppsCapturados = [];
            $scope.rrpps = [];
            var eventIdSelect = localStorage.getItem('eventIdSelect');
            console.log(eventIdSelect);
            var eventId = $routeParams.id || eventIdSelect; // id del evento entregador por url
            var eventoCompleto = [];
            firebase.database().ref('events/').child(eventId).once('value', function(snapshot) {
                eventoCompleto = snapshot.val() ;
            });




            firebase.database().ref('doormans/').child(doorman.$id || doorman.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);

                if (exists == true) {
                    var ref = firebase.database().ref('/doormans/').child(doorman.$id || doorman.uid);
                    var doormLocal = $firebaseObject(ref);
                    doormLocal.$loaded().then(function () {
                        doormanLogeado = doormLocal;
                        console.log(doormanLogeado);

                        var rrpps = $firebaseArray(firebase.database().ref('/events/'+eventIdSelect+'/rrpps'));
                        rrpps.$loaded().then(function () {
                                $scope.rrpps = rrpps;
                                console.log($scope.rrpps);

                        });




                    });
                } else {
                    window.currentDoorman = "";
                    doormanLogeado = "";
                    console.log(window.currentDoorman + " NO ENTRE");
                };

            });









            $scope.AgregarPersonas = function (index,rrppSelect) {
             console.log(index + "  "+ rrppSelect);



                $mdDialog.show({
                    controller: ControllerdialogAgregarPersonas,
                    templateUrl: 'dialogAgregarPersonas',
                    parent: angular.element(document.body),
                    clickOutsideToClose:true,
                    locals : {
                        rrppSelect : rrppSelect,
                        index : index
                    }
                });


            };

            // var element = document.querySelector('meta[property="og:image"]');
            // var content = element && element.getAttribute("content");

            function ControllerdialogAgregarPersonas($scope, $mdDialog,$timeout, $q, $log, rrppSelect,index) {
                if(index == 'noRRPP'){
                    $scope.rrppSelect = [];
                    $scope.rrppSelect.uid = 'noRRPP';

                    firebase.database().ref('events/' + eventId + '/rrpps/'+index).update({
                        name : 'Sin RRPP',
                        uid : index,
                        email : 'sinrrpp@izinait.com'
                    });

                }else{
                    $scope.rrppSelect = rrppSelect;
                }
                console.log(index);
                console.log($scope.rrppSelect.uid);
                $scope.gratisHombre = 0;
                $scope.valorGratisHombre = 0;
                $scope.gratisMujer = 0;
                $scope.valorGratisMujer = 0;
                $scope.extraHombre = 0;
                $scope.valorExtraHombre = 0;
                $scope.extraMujer = 0;
                $scope.valorExtraMujer = 0;
                $scope.vipHombre = 0;
                $scope.valorVipHombre = 0;
                $scope.vipMujer = 0;
                $scope.valorVipMujer = 0;

                $scope.aumentargratisHombre = function (gratisHombre) {
                    if(gratisHombre >= 0)
                    {
                        console.log("funciona")
                        $scope.gratisHombre += 1;
                    }

                };

                $scope.disminuirgratisHombre = function (gratisHombre) {
                    if(gratisHombre == 0){
                        console.log("no se puede disminiur menos");
                    }else {
                        console.log("funciona")
                        $scope.gratisHombre -= 1;
                    }
                };

                $scope.aumentargratisMujer = function (gratisMujer) {
                    if(gratisMujer >= 0)
                    {
                        console.log("funciona")
                        $scope.gratisMujer += 1;
                    }

                };

                $scope.disminuirgratisgratisMujer = function (gratisMujer) {
                    if(gratisMujer == 0){
                        console.log("no se puede disminiur menos");
                    }else {
                        console.log("funciona")
                        $scope.gratisMujer -= 1;
                    }
                };

                $scope.aumentarExtraMujer = function (extraMujer) {
                    if(extraMujer >= 0)
                    {
                        console.log("funciona")
                        $scope.extraMujer += 1;
                    }

                };

                $scope.disminuirExtraMujer = function (extraMujer) {
                    if(extraMujer == 0){
                        console.log("no se puede disminiur menos");
                    }else {
                        console.log("funciona")
                        $scope.extraMujer -= 1;
                    }
                };

                $scope.aumentarExtraHombre = function (extraHombre) {
                    if(extraHombre >= 0)
                    {
                        console.log("funciona")
                        $scope.extraHombre += 1;
                    }

                };

                $scope.disminuirExtraHombre = function (extraHombre) {
                    if(extraHombre == 0){
                        console.log("no se puede disminiur menos");
                    }else {
                        console.log("funciona")
                        $scope.extraHombre -= 1;
                    }
                };

                $scope.aumentarVipHombre = function (vipHombre) {
                    if(vipHombre >= 0)
                    {
                        console.log("funciona")
                        $scope.vipHombre += 1;
                    }

                };

                $scope.disminuirVipHombre = function (vipHombre) {
                    if(vipHombre == 0){
                        console.log("no se puede disminiur menos");
                    }else {
                        console.log("funciona")
                        $scope.vipHombre -= 1;
                    }
                };

                $scope.aumentarVipMujer = function (vipMujer) {
                    if(vipMujer >= 0)
                    {
                        console.log("funciona")
                        $scope.vipMujer += 1;
                    }

                };

                $scope.disminuirVipMujer = function (vipMujer) {
                    if(vipMujer == 0){
                        console.log("no se puede disminiur menos");
                    }else {
                        console.log("funciona")
                        $scope.vipMujer -= 1;
                    }
                };







                $scope.guardar = function () {
                    var newIdPuerta = firebase.database().ref().child('ticketsCreate/').push().key;

                    var puertaTicket =
                        {
                            gratisHombre : $scope.gratisHombre,
                            valorGratisHombre : $scope.valorGratisHombre,
                            gratisMujer :  $scope.gratisMujer,
                            valorGratisMujer : $scope.valorGratisMujer,
                            extraHombre : $scope.extraHombre,
                            valorExtraHombre : $scope.valorExtraHombre ,
                            extraMujer : $scope.extraMujer,
                            valorExtraMujer :  $scope.valorExtraMujer,
                            vipHombre : $scope.vipHombre,
                            valorVipHombre :  $scope.valorVipHombre,
                            vipMujer :  $scope.vipMujer,
                            valorVipMujer : $scope.valorVipMujer,
                            rrppId :  $scope.rrppSelect.uid,
                            date : new Date().getTime()
                        };
                    console.log(puertaTicket);

                    firebase.database().ref('events/' + eventId + '/puertaTickets/'+newIdPuerta).set(puertaTicket);

                    var rrppsCapturados = $firebaseObject(firebase.database().ref('events/'+eventIdSelect+'/rrpps'));
                    rrppsCapturados.$loaded().then(function () {
                        $scope.rrppsCapturado = rrppsCapturados;
                        $scope.rrppsCapturado.forEach(function (lk) {
                            if (lk.uid == $scope.rrppSelect.uid) {
                                console.log(lk);
                                lk.numeroTotal =
                                    lk.numeroTotal +
                                    $scope.extraMujer +
                                    $scope.extraHombre +
                                    $scope.gratisHombre +
                                    $scope.gratisMujer +
                                    $scope.vipHombre +
                                    $scope.vipMujer
                                firebase.database().ref('events/' + eventId + '/rrpps/' + index).update(lk);
                            }
                            ;
                        });

                    });
                    $mdDialog.hide();


                };



                $scope.hide = function() {
                    $mdDialog.hide();
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();

                };


            };




        }]);
