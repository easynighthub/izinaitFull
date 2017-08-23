/**
 * Created by andro on 07-08-2017.
 */
'use strict';

angular.module('myApp.clientes', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/clientes', {
                templateUrl: 'clientes/clientes.html',
                controller: 'clientesCtrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }


        );
    }])



    .controller('clientesCtrl', ['$scope','$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams,$firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {



            var admin = window.currentAdmin ;
            var adminLogeado = "";
            var clientes;
            $scope.clientes = [];





            $(sideEventos).removeClass( "active" );
            $(crearEventos).removeClass( "active" );

            $(verEventosFuturos).removeClass( "active" );
            $(sideClientes).addClass( "active" );
            $(sideRrpp).removeClass( "active" );

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
                        }else{
                            var clubNombreMostrar = [];
                            var clubNombre = firebase.database().ref().child('clubs');
                            $scope.clubNombre = $firebaseArray(clubNombre);
                            $scope.clubNombre.$loaded().then(function() {
                                clubNombreMostrar = $scope.clubNombre;
                                clubNombreMostrar.forEach(function (x) {
                                    if(x.$id == adminLogeado.idClubWork){
                                        $('.clubSelecionado').text(x.name + " ");
                                        $scope.clubDeClientes = x.name;
                                        $( ".clubSelecionado" ).append( "<b class='caret'> </b>" );
                                    };
                                });
                            });

                        };
                        firebase.database().ref('admins/'+adminLogeado.$id+'/clients').child(adminLogeado.idClubWork).once('value', function(snapshot) {
                                console.log(snapshot.val());
                                clientes = snapshot.val();
                                if(clientes != null){
                                    angular.forEach(Object.keys(clientes), function(client){
                                        var clientesRequest = $firebaseObject(firebase.database().ref('/users/' + client));
                                        clientesRequest.$loaded().then(function(){
                                         adminLogeado.idClubWork;

                                            console.log([clientesRequest.events[adminLogeado.$id]]);
                                            angular.forEach([clientesRequest.events[adminLogeado.$id]],function (asistencias) {
                                              console.log(Object.keys(asistencias));
                                                if(asistencias ==  adminLogeado.idClubWork){
                                                   console.log("hooola");
                                                }


                                            });


                                            getLastEvent(clientesRequest);
                                        });
                                    });
                                        }

                        });
                        $('.tituloIziboss').text("Cientes");
                        $('.no-js').removeClass('nav-open');
                        document.getElementById('BarraCargando').style.display = 'none';

                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                };

            });

            var getLastEvent = function(client){

                var lastDate = 971146800000;
                console.log(client);


                var events = client.events[adminLogeado.$id];
                console.log(events);
                angular.forEach(events, function(event){
                    console.log(event);
                    if (event > lastDate){
                        lastDate = event;
                    }
                });
                client.lastDate = lastDate;
                $scope.clientes.push(client);
                console.log($scope.clientes);
            };









        }]);
