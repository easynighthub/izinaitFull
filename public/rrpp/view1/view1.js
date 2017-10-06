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
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/rrpps/').child(rrpp.$id || rrpp.uid);
                    var rrppLocal = $firebaseObject(ref);
                    rrppLocal.$loaded().then(function () {
                        rrppLogeado = rrppLocal;
                        $('.photo').prepend($('<img>',{id:'theImg',src:rrppLogeado.picture}));
                        console.log(rrppLogeado);

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
                    window.location = "https://www.izinait.com/admin.html";
                };

            });





            function dialogControllerSelecionarClub($scope, $mdDialog, $timeout, $q, $log,adminLogeadoRecibido ,clubsCargados) {
                console.log(clubsCargados);
                console.log(adminLogeadoRecibido);
                $scope.clubs = clubsCargados;

                $scope.clubsSelecionados = [];

                $scope.selecionarClubs = function (club) {
                    club.selecionado = !club.selecionado;
                    console.log($scope.clubs);
                };

                $scope.aceptarClub = function () {
                    $scope.clubs.forEach(function (x) {
                        if(x.selecionado == true){
                            firebase.database().ref('admins/' + adminLogeadoRecibido.$id+'/clubs/'+x.$id).update(
                                {
                                    uid: x.$id,
                                    activoParaCrearEventos: true,
                                    validado:false,
                                    nombre: x.name
                                });

                        };
                    });
                    $mdDialog.hide();
                    location.reload();

                };

                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };

            var cambiarNickName = function (rrppLogeadoRecibido) {
                console.log(rrppLogeadoRecibido);


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
                console.log(rrppLogeadoRecibido);

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



                      var buscarNickname = firebase.database().ref('/nickName');
                      var buscarmeRequest = $firebaseArray(buscarNickname);
                      buscarmeRequest.$loaded().then(function () {
                          $scope.nickNameSelect = buscarmeRequest;
                          $scope.nickNameSelect.forEach(function (x) {

                              console.log("entre si mi nick estiste dentro de los rrpps");
                              if(x.nickName == $scope.nickName){
                                  nickNameYaExiste = true ;
                              }

                              console.log(nickNameYaExiste);
                              cantidad++;
                              console.log(cantidad);

                              if(cantidad == $scope.nickNameSelect.length){
                                  console.log("entra esta wea")
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
                window.open('https://izinait.com/app/#!/detalleEvento?id=' + evento.$id, '_blank')
            };

            $scope.duplicateEvent = function(event) {
                $rootScope.eventToRepet = event;
                $rootScope.eventEdit = undefined;
                document.location.href = '#!/crearEvento';
            };

            $scope.editEvent = function(event) {
                $rootScope.eventEdit = event;
                $rootScope.eventToRepet = undefined;
                document.location.href = '#!/crearEvento';
            };


            var getFuturesEvents = function(event) {
                var currentDay = new Date().getTime();
                var visible = true;
                if (currentDay < event.toHour){


                        $scope.events.push(event);
                        console.log("=================== se muestra")
                        return true;

                }
                else
                    return false;
            };



        }]);
