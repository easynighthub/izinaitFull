/**
 * Created by Andro Ostoic on 11-12-2016.
 */


'use strict';

angular.module('myApp.rrpps', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/rrpps', {
            templateUrl: 'rrpps/rrpps.html',
            controller: 'rrppsCtrl'
        });
    }])

    .controller('rrppsCtrl', ['$scope', '$rootScope', '$firebaseArray', '$firebaseObject','$mdDialog',
        function($scope, $rootScope, $firebaseArray, $firebaseObject,$mdDialog) {



            $(configuracion).addClass( "active" );
            $(eventos).removeClass( "active" );
            var admin = window.currentAdmin ;
            var adminLogeado = "";
            $scope.rrpps = [];
            $scope.Allrrpps = [];


            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
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
                                        $('.clubSelecionado').text(x.name);
                                    }
                                });
                                traerRRPPS(adminLogeado.idClubWork);
                            });

                        };
                        console.log(adminLogeado);

                        document.getElementById('BarraCargando').style.display = 'none';
                        document.getElementById('panelPrincipal').style.display = 'block';
                        $('.tituloIziboss').text("Relaciones Publicas");
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                };

            });

            var traerRRPPS = function (clubId) {
                var rrpps = $firebaseArray(firebase.database().ref('admins/'+adminLogeado.$id+'/rrpps'));

                rrpps.$loaded().then(function(){
                    console.log(rrpps);
                    $scope.Allrrpps = rrpps;

                    $scope.Allrrpps.forEach(function (x) {
                        console.log(x.clubs);
                        if(Object.keys(x.clubs).indexOf(clubId) >= 0){
                            var buscarNick = $firebaseObject(firebase.database().ref('rrpps/'+x.$id));
                            buscarNick.$loaded().then(function () {
                                x.nickName = buscarNick.nickName;
                                $scope.rrpps.push(x);
                            });
                        }




                    });
                });
            };

            $scope.agregarDoorman = function() {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.prompt()
                    .title('Cual es el correo de doorman que deseas agregar?')
                    .textContent('Si el correo existe se asignara automaticamente, si no, se creeara y se le notificara con correo al doormans ingresado.')
                    .placeholder('Correo Electronico')
                    .ariaLabel('Correo Electronico')
                    .initialValue('')
                    .ok('Asignar!')
                    .cancel('Cancelar');

                $mdDialog.show(confirm).then(function(result) {
                    //exitoso

                }, function() {
                    //si no !
                });
            };













           
        }]);
