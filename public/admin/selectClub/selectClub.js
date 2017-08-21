/**
 * Created by andro on 19-07-2017.
 */

'use strict';

angular.module('myApp.selectClub', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/selectClub', {
                templateUrl: 'selectClub/selectClub.html',
                controller: 'selectClubCtrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }


        );
    }])



    .controller('selectClubCtrl', ['$scope','$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams,$firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {



            var admin = window.currentAdmin ;
            var adminLogeado = "";

         //   $(eventos).removeClass( "active" );
           // $(configuracion).removeClass( "active" );

            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        console.log(adminLogeado);
                        if(adminLogeado.idClubWork == false){
                            ObtenerClub (adminLogeado);
                        }else{
                            var clubNombreMostrar = [];
                            var clubNombre = firebase.database().ref().child('clubs');
                            $scope.clubNombre = $firebaseArray(clubNombre);
                            $scope.clubNombre.$loaded().then(function() {

                                clubNombreMostrar = $scope.clubNombre;
                                clubNombreMostrar.forEach(function (x) {
                                    if(x.$id == adminLogeado.idClubWork){
                                        $('.clubSelecionado').text(x.name +" ");
                                        $( ".clubSelecionado" ).append( "<b class='caret'> </b>" );
                                    }
                                });
                            });
                            ObtenerClub (adminLogeado);

                        };
                    });

                    $('.no-js').removeClass('nav-open');
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

                        }
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

            var ObtenerClub = function (adminLogeadoRecibido) {
                console.log(adminLogeadoRecibido.clubs);

                if(adminLogeadoRecibido.clubs == undefined){
                    var clubsCargados = [];
                    var clubsER = firebase.database().ref().child('clubs');
                    $scope.clubsER = $firebaseArray(clubsER);
                    $scope.clubsER.$loaded().then(function(){

                        clubsCargados = $scope.clubsER;
                        clubsCargados.forEach(function (x) {
                            x.selecionado = false;
                        });

                        $mdDialog.show({
                            controller: dialogControllerSelecionarClub,
                            templateUrl: 'dialogSelecionarClub',
                            parent: angular.element(document.body),
                            clickOutsideToClose: true,
                            locals: {
                                adminLogeadoRecibido: adminLogeadoRecibido,
                                clubsCargados :clubsCargados
                            }
                        });
                    });



                }else{
                    var clubsParaAdministrar = adminLogeadoRecibido.clubs;
                    $mdDialog.show({
                        controller: dialogControllerAdministrarClub,
                        templateUrl: 'dialogAdministrarClub',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        locals: {
                            adminLogeadoRecibido: adminLogeadoRecibido,
                            clubsParaAdministrar :clubsParaAdministrar
                        }
                    });
                }
            };

            function dialogControllerAdministrarClub($scope, $mdDialog, $timeout, $q, $log,adminLogeadoRecibido ,clubsParaAdministrar) {
                console.log(clubsParaAdministrar);
                console.log(adminLogeadoRecibido);
                $scope.clubs = clubsParaAdministrar;

                $scope.administrarClub = function (club) {
                    console.log(club);

                    firebase.database().ref('admins/' + adminLogeadoRecibido.$id).update(
                        {idClubWork:club.uid});
                    $('.clubSelecionado').text(club.nombre);

                    $mdDialog.hide();
                    location.href = "#!/view1";

                };

                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };






        }]);

