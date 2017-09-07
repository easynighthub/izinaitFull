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
            $(contenido).css("padding-top", "30px ");


            $(sideEventos).removeClass("active");
            $(crearEventos).removeClass("active");

            $(verEventosFuturos).removeClass("active");
            $(verEventosPasados).removeClass("active");
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
                            console.log(clientes);
                            if (clientes != null) {
                                $scope.cantidadDeClientesPorClub = 0;
                                $scope.cantidadDeHombres = 0;
                                $scope.cantidadDeMujeres = 0;
                                $scope.sumaEdadClientes = 0;


                                angular.forEach(Object.keys(clientes), function (client) {
                                    var clientesRequest = $firebaseObject(firebase.database().ref('/users/' + client));
                                    clientesRequest.$loaded().then(function () {
                                        $scope.cantidadDeClientesPorClub += 1;
                                       var fechaActual = new Date().getTime();
                                       var edadClient = ((fechaActual - (new Date(clientesRequest.birthday).getTime()))/ 31556926000);
                                        clientesRequest.edad = edadClient;

                                        $scope.sumaEdadClientes +=edadClient;

                                        if(clientesRequest.gender == "female"){
                                            $scope.cantidadDeMujeres +=1;
                                        }else{
                                            $scope.cantidadDeHombres += 1;
                                        };
                                        $scope.porcentajeHombres = (($scope.cantidadDeHombres+$scope.cantidadDeMujeres)/$scope.cantidadDeHombres*100);
                                        $scope.porcentajeMujeres = (($scope.cantidadDeHombres+$scope.cantidadDeMujeres)/$scope.cantidadDeMujeres*100);
                                        if($scope.cantidadDeMujeres == 0){
                                            $scope.porcentajeMujeres = 0;
                                        };
                                        if($scope.cantidadDeHombres == 0){
                                            $scope.porcentajeHombres = 0;
                                        }

                                        getLastEvent(clientesRequest);


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

                var lastDate = 1;
                var EventAsists = 0;
                //console.log(client);

                firebase.database().ref('users/').child(client.$id+'/events/'+adminLogeado.$id+'/'+adminLogeado.idClubWork).once('value', function (snapshot) {
                    var events = snapshot.val();
                    angular.forEach(events, function (event) {
                        if (event > lastDate) {
                            lastDate = event;
                            EventAsists += 1;
                        }
                    });
                    client.lastDate = lastDate;
                    client.EventAsists = EventAsists;
                    $scope.clientes.push(client);
                    //console.log($scope.clientes);

                });


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
