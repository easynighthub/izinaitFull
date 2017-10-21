/**
 * Created by andro on 20-10-2017.
 */




'use strict';

angular.module('myApp.detalleEvento', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/detalleEvento', {
                templateUrl: 'detalleEvento/detalleEvento.html',
                controller: 'detalleEventoCtrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }


        );
    }])



    .controller('detalleEventoCtrl', ['$scope','$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams,$firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {



            var rrpp = window.currentRRPP;
            var rrppLogeado = "";
            $scope.corteciasUtilizadas = {};
            $scope.corteciasUtilizadas.general = 0;
            $scope.corteciasUtilizadas.vipMesa = 0;
            $scope.corteciasUtilizadas.vip = 0;

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


                                var eventsRequest = $firebaseObject(firebase.database().ref('/events/' + $routeParams.id));
                                eventsRequest.$loaded().then(function(){
                                  $scope.event =eventsRequest;
                                  console.log($scope.event);




                                  angular.forEach($scope.event.asist , function (x) {
                                  if(x.idRRPP == rrppLogeado.$id){
                                      if(x.tipo == 'vipMesa'){
                                          $scope.corteciasUtilizadas.vipMesa += x.totalList;
                                      }
                                      if(x.tipo == 'general'){
                                          $scope.corteciasUtilizadas.general += x.totalList;
                                      }
                                      if(x.tipo == 'vip'){
                                          $scope.corteciasUtilizadas.vip += x.totalList;
                                      }

                                  }


                                  });




                                    var idClub = Object.keys(eventsRequest.clubs)[0];

                                    var corteciasHabilitadas = $firebaseObject(firebase.database().ref('/admins/' + eventsRequest.admin +'/rrpps/'+rrppLogeado.$id+'/cortecias/'+idClub));
                                    corteciasHabilitadas.$loaded().then(function(){
                                        console.log(corteciasHabilitadas);
                                        $scope.corteciasHabilitadas = corteciasHabilitadas;

                                        if($scope.corteciasHabilitadas.$value != null){

                                           $scope.corteciasHabilitadas.vip;
                                            $scope.corteciasHabilitadas.general;
                                           $scope.corteciasHabilitadas.vipMesa;

                                        }


                                    });
                                });




                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/rrpp.html";
                };

            });




            $scope.mandarCortecia =function () {




                $mdDialog.show({
                    controller: dialogControllerMandarCortecia,
                    templateUrl: 'dialogMandarCortecia',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        event: $scope.event,
                        corteciasHabilitadas : $scope.corteciasHabilitadas,
                        corteciasUtilizadas: $scope.corteciasUtilizadas
                    }
                });

            };

            function dialogControllerMandarCortecia($scope, $mdDialog, $timeout, $q, $log,event,corteciasHabilitadas,corteciasUtilizadas) {

                $scope.event = event;
                console.log($scope.event);

                $scope.corteciasHabilitadas = corteciasHabilitadas;
                $scope.corteciasUtilizadas = corteciasUtilizadas;

                console.log(corteciasHabilitadas);
                console.log(corteciasUtilizadas);


                $scope.tipoCortecias = [];
                $scope.cantidad = 1;

                var users = $firebaseArray(firebase.database().ref().child('users'));
                users.$loaded().then(function () {

                });

                var usersManual = $firebaseArray(firebase.database().ref().child('usersManual'));
                usersManual.$loaded().then(function () {

                });

                angular.forEach($scope.corteciasHabilitadas ,function (x,key) {

                    $scope.tipoCortecias.push({
                        cantidad : x,
                        tipo :key
                    })
                });

                $scope.limite = 0;

                $scope.masEntradas = function () {
                        if(  $scope.cantidad < $scope.limite){
                            $scope.cantidad += 1;
                        }
                };



                $scope.menosEntradas = function () {
                    if( $scope.cantidad  > 1  ){
                        $scope.cantidad -= 1;
                    }

                };




                $scope.cantidadDeEntradas =function (tipo) {
                    console.log(tipo);
                    $scope.tipo = tipo.trim();


            if($scope.tipo == 'general'){
                $scope.limite  =  $scope.corteciasHabilitadas.general - $scope.corteciasUtilizadas.general;
                console.log($scope.limite);
            };
                    if($scope.tipo == 'vip'){
                        $scope.limite  =  $scope.corteciasHabilitadas.vip - $scope.corteciasUtilizadas.vip;
                        console.log($scope.limite);
                    };
                    if($scope.tipo == 'vipMesa'){
                        $scope.limite  =  $scope.corteciasHabilitadas.vipMesa - $scope.corteciasUtilizadas.vipMesa;
                        console.log($scope.limite);
                    };

                    if($scope.limite == 0){
                        $scope.cantidad = 0;

                    }else {
                        $scope.cantidad = 1;
                    };

                }


                $scope.enviarCortecias = function () {
                    $scope.nuevaAsistencia = {};
                    $scope.nuevaAsistencia.asistencia = false;
                    $scope.nuevaAsistencia.fechaClick = Date.now();
                    $scope.nuevaAsistencia.totalList = $scope.cantidad;
                    $scope.nuevaAsistencia.totalAsist = 0;
                    $scope.nuevaAsistencia.displayName = $scope.nombreCompleto;
                    $scope.nuevaAsistencia.idRRPP = rrppLogeado.$id;
                    $scope.nuevaAsistencia.tipo = $scope.tipoSelecionado.trim();

                    if($scope.nuevaAsistencia.tipo == "general"){
                        $scope.nuevaAsistencia.fechaCaducacion = $scope.event.hourCorteciaGeneral;
                    };
                    if($scope.nuevaAsistencia.tipo == "vip"){
                        $scope.nuevaAsistencia.fechaCaducacion = $scope.event.hourCorteciaVip;
                    };
                    if($scope.nuevaAsistencia.tipo == "vipMesa"){
                        $scope.nuevaAsistencia.fechaCaducacion = $scope.event.hourCorteciaVipMesa;
                    };

                    $scope.nuevaAsistencia.email = $scope.email;
                    $scope.nuevaAsistencia.cortecia = true;


                       var contadorUsers = 0;
                       var contadorUsersManual = 0;
                        //console.log(users);
                        users.forEach(function (x) {
                            //noinspection JSAnnotator,JSAnnotator
                            if(x.email == $scope.email)
                            {
                                $scope.nuevaAsistencia.id = x.$id;
                                $scope.nuevaAsistencia.userFacebook = true;
                                console.log( $scope.nuevaAsistencia);
                                firebase.database().ref('events/' +  $scope.event.$id + '/asist/' + $scope.nuevaAsistencia.id).update($scope.nuevaAsistencia);
                                throw x;
                            } else
                                {
                                    contadorUsers += 1;
                                };
                        });
                        if(contadorUsers == users.length){
                            usersManual.forEach(function (j) {
                                if(j.email == $scope.email){
                                    $scope.nuevaAsistencia.id =j.$id;
                                    $scope.nuevaAsistencia.userFacebook = false;
                                    console.log( $scope.nuevaAsistencia);
                                    firebase.database().ref('events/' +  $scope.event.$id + '/asist/' + $scope.nuevaAsistencia.id).update($scope.nuevaAsistencia);
                                    throw j;
                                }else{
                                    contadorUsersManual +=1;
                                }
                            });
                        };

                        if(contadorUsersManual == usersManual.length){
                            var nuevoUsuario = firebase.database().ref().child('usersManual/').push().key;

                            firebase.database().ref('usersManual/' + nuevoUsuario ).update({
                                celular: $scope.celular,
                                email: $scope.email,
                                nombreCompleto: $scope.nombreCompleto}).then(
                                    function (s) {
                                        $scope.nuevaAsistencia.id = nuevoUsuario;
                                        $scope.nuevaAsistencia.userFacebook = false;
                                        console.log( $scope.nuevaAsistencia);
                                        firebase.database().ref('events/' +  $scope.event.$id + '/asist/' + nuevoUsuario).update($scope.nuevaAsistencia);

                            });



                        };




                };



                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };











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

















        }]);