/**
 * Created by andro on 08-09-2017.
 */
'use strict';

angular.module('myApp.perfil', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/perfil', {
                templateUrl: 'perfil/perfil.html',
                controller: 'perfilCtrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }
        );
    }])


    .controller('perfilCtrl', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope', '$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $mdDialog) {
            $scope.data = {
                model: null,
                availableOptions: [
                    {id: '1', name: 'Option A'},
                    {id: '2', name: 'Option B'},
                    {id: '3', name: 'Option C'}
                ]
            };


            var admin = window.currentAdmin;
            var adminLogeado = "";
            $scope.eventosFuturoFecha = new Date().getTime();
            $scope.eventsWithServices = [];
            $scope.cuentaBancaria = {};
            $scope.ver = false ;

            $(sideEventos).addClass("active");
            $(crearEventos).removeClass("active");

            $(verEventosFuturos).addClass("active");
            $(verEventosPasados).removeClass("active");
            $(sideClientes).removeClass("active");
            $(sideRrpp).removeClass("active");
            $(sideDoorman).removeClass("active");
            $(contenido).css("padding-top", "30px ");
            $('.main-panel').perfectScrollbar('update');


            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);

                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        console.log(adminLogeado);
                        $scope.adminLogeado = adminLogeado;

                        $scope.cuentaBancaria = $scope.adminLogeado.cuentaBancaria;
                        $('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));
                        //console.log(adminLogeado);

                        var buscarNickname = firebase.database().ref('/nickName');
                        var buscarmeRequest = $firebaseArray(buscarNickname);
                        buscarmeRequest.$loaded().then(function () {
                            $scope.nickNameSelect = buscarmeRequest;
                            $scope.nickNameSelect.forEach(function (x) {
                                console.log(x);
                                if(x.$id == $scope.adminLogeado.$id){
                                    $scope.adminLogeado.nickName = x.nickName ;
                                };

                            });
                        });

                        if (adminLogeado.idClubWork == false) {
                            location.href="#!/view1";

                        } else {
                            var clubNombreMostrar = [];
                            var clubNombre = firebase.database().ref().child('clubs');
                            $scope.clubNombre = $firebaseArray(clubNombre);
                            $scope.clubNombre.$loaded().then(function () {
                                clubNombreMostrar = $scope.clubNombre;
                                clubNombreMostrar.forEach(function (x) {
                                    if (x.$id == adminLogeado.idClubWork) {
                                        $('.clubSelecionado').text(x.name + " ");
                                        $(".clubSelecionado").append("<b class='caret'> </b>");
                                    }
                                    ;
                                });
                            });

                        };
                        $('.tituloIziboss').text("Perfil Productor");

                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                }
                ;

            });


$scope.agregarClub = function () {
    swal({
        title: "Estamos mejorando!",
        text: "En esta version, no se puede agregar clubs manualmente, ponte en contacto con nosotros  contacto@izinait.com!",
        buttonsStyling: true,
        confirmButtonClass: "btn btn-warning",
        type: "warning",
    });
}




            $scope.actualizarCuentaBancaria = function () {
                console.log("llegue a guardar");
                if($scope.cuentaBancaria.banco != ''){
                    if($scope.cuentaBancaria.tipoDeCuenta != ''){
                        if($scope.cuentaBancaria.nombre != ''){
                            if($scope.cuentaBancaria.numeroCuenta != ''){
                                if($scope.cuentaBancaria.rut != ''){
                                    $scope.ver = false ;
                            console.log("llegue a guardar");
                                    firebase.database().ref('admins/' + adminLogeado.$id + '/cuentaBancaria').set($scope.cuentaBancaria).then(
                                        function (s) {
                                            console.log('se guardaron bien los servicios ', s);

                                            swal({
                                                title: "Exelente!",
                                                text: "Tu cuenta bancaria han sido actualizada exitosamente!",
                                                buttonsStyling: true,
                                                confirmButtonClass: "btn btn-success",
                                                type: "success"
                                            });

                                        }, function (e) {
                                            alert('Error, intente de nuevo');
                                            console.log('se guardo mal ', e);
                                        }
                                    );
                                }

                            }

                        }
                    }
                }

            };





            $scope.editarCuentaBancaria = function () {
                $scope.ver = true ;
            };



            $scope.actualizarPerfil = function () {

                var nickNameYaExiste = false ;
                var cantidad = 0;
                $scope.adminLogeado.nickName = $scope.adminLogeado.nickName.toLowerCase();
                $scope.pasado = $scope.adminLogeado.nickName.toLowerCase();


                var buscarNickname = firebase.database().ref('/nickName');
                var buscarmeRequest = $firebaseArray(buscarNickname);
                buscarmeRequest.$loaded().then(function () {
                    $scope.nickNameSelect = buscarmeRequest;
                    $scope.nickNameSelect.forEach(function (x) {

                        //console.log("entre si mi nick estiste dentro de los rrpps");
                        if(x.nickName == $scope.adminLogeado.nickName){
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

                        if($scope.adminLogeado.celular.toString().length > 7) {
                            firebase.database().ref('admins/' + $scope.adminLogeado.$id).update(
                                {
                                    celular: $scope.adminLogeado.celular,
                                });

                            firebase.database().ref('rrpps/' + $scope.adminLogeado.$id).update(
                                {
                                    nickName: $scope.adminLogeado.nickName,
                                    confirm : true,
                                    email :$scope.adminLogeado.email
                                });
                            firebase.database().ref('nickName/' + $scope.adminLogeado.$id).update(
                                {
                                    nickName:$scope.adminLogeado.nickName,
                                    uid :$scope.adminLogeado.$id
                                });

                            swal({
                                title: "Exelente!",
                                text: "Tus datos han sido actualizados exitosamente!",
                                buttonsStyling: true,
                                confirmButtonClass: "btn btn-success",
                                type: "success",
                            });

                        }




                    }else{

                        if($scope.pasado ==  $scope.adminLogeado.nickName){

                                if($scope.adminLogeado.celular.toString().length > 7){


                                    firebase.database().ref('admins/' + $scope.adminLogeado.$id).update(
                                        {
                                            celular : $scope.adminLogeado.celular,
                                        });
                                    firebase.database().ref('rrpps/' + $scope.adminLogeado.$id).update(
                                        {
                                            nickName: $scope.adminLogeado.nickName,
                                            confirm : true,
                                            email :$scope.adminLogeado.email
                                        });
                                    firebase.database().ref('nickName/' + $scope.adminLogeado.$id).update(
                                        {
                                            nickName:$scope.adminLogeado.nickName,
                                            uid :$scope.adminLogeado.$id
                                        });

                                    swal({
                                        title: "Exelente!",
                                        text: "Tus datos han sido actualizados exitosamente!",
                                        buttonsStyling: true,
                                        confirmButtonClass: "btn btn-success",
                                        type: "success"
                                    });


                                }else {
                                    swal({
                                        title: "Hay algo mal!",
                                        text: "El celular que ingresas es invalido !",
                                        buttonsStyling: true,
                                        confirmButtonClass: "btn btn-warning",
                                        type: "warning"
                                    });
                                }




                        }else{
                            swal({
                                title: "Hay algo mal!",
                                text: "El nickname ya esta siendo utilizado por otra persona, intente con otro!",
                                buttonsStyling: true,
                                confirmButtonClass: "btn btn-warning",
                                type: "warning"
                            });
                        }


                    };

                };

            };





        }]);
