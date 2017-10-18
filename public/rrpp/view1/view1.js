/**
 * Created by andro on 24-08-2017.
 */


'use strict';

angular.module('myApp.view1', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
                templateUrl: 'view1/view1.html',
                controller: 'View1Ctrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }


        );
    }])



    .controller('View1Ctrl', ['$scope','$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams,$firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {



            var rrpp = window.currentRRPP;
            var rrppLogeado = "";
            $scope.eventosFuturoFecha = new Date().getTime();
            $scope.eventsWithServices = [];
            $scope.events = [];





            $(sideEventos).addClass("active");

            firebase.database().ref('rrpps/').child(rrpp.$id || rrpp.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                //console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/rrpps/').child(rrpp.$id || rrpp.uid);
                    var rrppLocal = $firebaseObject(ref);
                    rrppLocal.$loaded().then(function () {
                        rrppLogeado = rrppLocal;
                        $('.photo').prepend($('<img>',{id:'theImg',src:firebase.auth().currentUser.photoURL}));
                        $('.clubSelecionado').text(  rrppLogeado.name+ " ");
                        //console.log(rrppLogeado);
                                console.log(firebase.auth().currentUser);
                        if(rrppLogeado.confirm == false){
                            cambiarNickName(rrppLogeado);
                        };
                            if(rrppLogeado.events  != undefined){
                                angular.forEach(Object.keys(rrppLogeado.events), function(event){
                                    var eventsRequest = $firebaseObject(firebase.database().ref('/events/' + event));
                                    eventsRequest.$loaded().then(function(){
                                        getFuturesEvents(eventsRequest);
                                    });
                                });
                            };


                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/rrpp.html";
                };

            });









            var cambiarNickName = function (rrppLogeadoRecibido) {
                //console.log(rrppLogeadoRecibido);


                    var rrppLogeadoRecibido = rrppLogeadoRecibido;
                    $mdDialog.show({
                        controller: dialogControllerCambiarNickName,
                        templateUrl: 'dialogCambiarNickName',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        locals: {
                            rrppLogeadoRecibido: rrppLogeadoRecibido
                        }
                    });

            };

            function dialogControllerCambiarNickName($scope, $mdDialog, $timeout, $q, $log,rrppLogeadoRecibido) {
                //console.log(rrppLogeadoRecibido);

                if(rrppLogeadoRecibido.uid == rrppLogeadoRecibido.nickName){
                    $scope.nickName = "";
                };
                if(rrppLogeadoRecibido.email == 'null@izinait.com'){
                    $scope.email = "";
                }else{
                    $scope.email = rrppLogeadoRecibido.email;
                }

                $scope.confirmarDatos = function () {

                    var nickNameYaExiste = false ;
                    var cantidad = 0;
                    $scope.nickName = $scope.nickName.toLowerCase();


                      var buscarNickname = firebase.database().ref('/nickName');
                      var buscarmeRequest = $firebaseArray(buscarNickname);
                      buscarmeRequest.$loaded().then(function () {
                          $scope.nickNameSelect = buscarmeRequest;
                          $scope.nickNameSelect.forEach(function (x) {

                              //console.log("entre si mi nick estiste dentro de los rrpps");
                              if(x.nickName == $scope.nickName){
                                  nickNameYaExiste = true ;
                              }

                              //console.log(nickNameYaExiste);
                              cantidad++;
                              //console.log(cantidad);

                              if(cantidad == $scope.nickNameSelect.length){
                                  //console.log("entra esta wea")
                                  $scope.function2();
                              };

                          });
                      });

                    $scope.function2 = function (){
                        if(nickNameYaExiste != true){
                            firebase.database().ref('rrpps/' + rrppLogeadoRecibido.$id).update(
                                {
                                    nickName: $scope.nickName,
                                    confirm : true,
                                    email :$scope.email
                                });
                            firebase.database().ref('nickName/' + rrppLogeadoRecibido.$id).update(
                                {nickName:$scope.nickName,
                                    uid :rrppLogeadoRecibido.$id
                                });
                            $mdDialog.hide();
                        }else{
                            alert("El NICKNAME utilizado ya existe en otro rrpp, elije, escribe algo distinto");
                        };

                    };



                    };


                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };





            $scope.goToEventDetails = function(evento ) {
                document.location.href = '#!/detalleEvento?id=' + evento.$id;
            };

            $scope.verEvento = function(evento ) {
                //document.location.href = 'https://izinait.com/app/#!/detalleEvento?id=' + evento.$id, '_blank';
                window.open('https://izinait.com/app/#!/detalleEvento?id=' + evento.$id+"&friend="+rrppLogeado.$id, '_blank')
            };






            var getFuturesEvents = function(event) {
                event.listTotalRRPP = 0;
                event.ticketTotalRRPP = 0;
                var currentDay = new Date().getTime();
                var visible = true;
                //if (currentDay < event.toHour){
                console.log(event);

                angular.forEach(event.asist , function (x) {

                    if(x.idRRPP == rrppLogeado.$id)
                    {
                        event.listTotalRRPP += x.totalList;
                        console.log(event.listTotalRRPP);
                    }
                    var ticketEvent = firebase.database().ref().child('tickets/'+event.id);
                    var ticketEventArray = $firebaseArray(ticketEvent);
                    ticketEventArray.$loaded().then(function () {
                        ticketEventArray.forEach(function (j) {
                            console.log(ticketEventArray);
                            if(j.rrppid == rrppLogeado.$id){
                                event.ticketTotalRRPP += 1;
                                console.log(event.ticketTotalRRPP);
                            }
                        })

                    });

                });
                    event.linkRRPP = "https://www.izinait.com/detalleEvento?id="+ event.id+"&friend="+rrppLogeado.$id;
                        $scope.events.push(event);
                        return true;

              //  }
                //else
                  //  return false;
            };



        }]);
