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


    .controller('clientesCtrl', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope', '$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $mdDialog) {


            var admin = window.currentAdmin;
            var adminLogeado = "";
            var clientes;
            $scope.clientes = [];

            $('.tituloIziboss').text("Clientes");
            $('.no-js').removeClass('nav-open');
            document.getElementById('BarraCargando').style.display = 'none';


            $(sideEventos).removeClass("active");
            $(crearEventos).removeClass("active");

            $(verEventosFuturos).removeClass("active");
            $(sideClientes).addClass("active");
            $(sideRrpp).removeClass("active");
            $(sideDoorman).removeClass("active");

            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);
                //console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        $('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));

                        //console.log(adminLogeado);
                        if (adminLogeado.idClubWork == false) {
                        } else {
                            var clubNombreMostrar = [];
                            var clubNombre = firebase.database().ref().child('clubs');
                            $scope.clubNombre = $firebaseArray(clubNombre);
                            $scope.clubNombre.$loaded().then(function () {
                                clubNombreMostrar = $scope.clubNombre;
                                clubNombreMostrar.forEach(function (x) {
                                    if (x.$id == adminLogeado.idClubWork) {
                                        $('.clubSelecionado').text(x.name + " ");
                                        $scope.clubDeClientes = x.name;
                                        $(".clubSelecionado").append("<b class='caret'> </b>");
                                    }
                                    ;
                                });
                            });

                        }
                        ;
                        firebase.database().ref('admins/' + adminLogeado.$id + '/clients').child(adminLogeado.idClubWork).once('value', function (snapshot) {
                            ////console.log(snapshot.val());
                            clientes = snapshot.val();
                            if (clientes != null) {
                                var contador = clientes.length;
                                angular.forEach(Object.keys(clientes), function (client) {
                                    var clientesRequest = $firebaseObject(firebase.database().ref('/users/' + client));
                                    clientesRequest.$loaded().then(function () {
                                        adminLogeado.idClubWork;

                                        ////console.log([clientesRequest.events[adminLogeado.$id]]);
                                        angular.forEach([clientesRequest.events[adminLogeado.$id]], function (asistencias) {
                                            ////console.log(Object.keys(asistencias));
                                            if (asistencias == adminLogeado.idClubWork) {
                                                ////console.log("hooola");
                                            }


                                        });


                                        getLastEvent(clientesRequest);
                                        contador = contador - 1;
                                        console.log('aun no entro' + contador);
                                        if (contador == 0) {
                                            console.log('entro' + contador);
                                            $('#dtClientes').DataTable(
                                                {
                                                    "pagingType": "simple_numbers"
                                                    , "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Todos"]]
                                                    , responsive: true
                                                    ,buttons: ['csv']
                                                    ,language: {search: "_INPUT_", searchPlaceholder: "Buscar"}
                                                }
                                            )

                                        }
                                    });
                                });
                            }

                        })


                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                }
                ;

            });

            var getLastEvent = function (client) {

                var lastDate = 971146800000;
                //console.log(client);


                var events = client.events[adminLogeado.$id];
                //console.log(events);
                angular.forEach(events, function (event) {
                    //console.log(event);
                    if (event > lastDate) {
                        lastDate = event;
                    }
                });
                client.lastDate = lastDate;
                $scope.clientes.push(client);
                //console.log($scope.clientes);
            };


            /* $scope.clientes.$loaded().then(function dtServicios() {
                 $('#dtClientes').DataTable(
                     {
                         "pagingType": "simple_numbers"
                         , "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Todos"]]
                         , responsive: true
                         ,buttons: ['csv']
                         , language: {
                         search: "_INPUT_"
                         , searchPlaceholder: "Buscar"
                     }
                     }
                 )

             })*/


        }]);
