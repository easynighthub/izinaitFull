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

            $scope.agregarRRPP = function() {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.prompt()
                    .title('Cual es el correo del RRPP que deseas agregar?')
                    .textContent('Si el correo existe se asignara automaticamente, si no, se creeara y se le notificara con correo al RRPP ingresado.')
                    .placeholder('Correo Electronico')
                    .ariaLabel('Correo Electronico')
                    .initialValue('')
                    .ok('Asignar!')
                    .cancel('Cancelar');

                $mdDialog.show(confirm).then(
                    function(result) {

                    if(validateEmail(result)){
                        var existe = false;
                        console.log($scope.rrpps);
                        $scope.rrpps.forEach(function (rrpp) {  //rrpps del clubs
                            if(rrpp.email == result){
                                existe = true;
                            };
                        });
                        if(existe){
                            alert('ESTE CORREO YA EXISTE');

                        }else
                        {
                            var todosLosRRPPs = $firebaseObject(firebase.database().ref('rrpps'));
                            todosLosRRPPs.$loaded().then(function () {
                                todosLosRRPPs.forEach(function (x) {
                                    if(x.email == result){
                                        console.log(x);
                                        firebase.database().ref('admins/'+adminLogeado.$id+'/rrpps/'+x.uid).update({
                                            uid:x.uid,
                                            bloqueado:false,
                                            visible:true,
                                            email:x.email
                                        });
                                        firebase.database().ref('admins/'+adminLogeado.$id+'/rrpps/'+x.uid +'/clubs/'+adminLogeado.idClubWork).update(true);


                                    }
                                });
                            });
                        }

                    };
                    //exitoso
                    }
                    );
            };

            function validateEmail(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }











           
        }]);
