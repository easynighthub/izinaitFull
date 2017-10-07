/**
 * Created by andro on 06-10-2017.
 */
/**
 * Created by andro on 08-09-2017.
 */
'use strict';

angular.module('myApp.facturacion', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/facturacion', {
                templateUrl: 'facturacion/facturacion.html',
                controller: 'facturacionCtrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }
        );
    }])


    .controller('facturacionCtrl', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope', '$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $mdDialog) {



            var admin = window.currentAdmin;
            var adminLogeado = "";
            $scope.eventsWithServices = [];
            $scope.eventosPasadosFecha = new Date().getTime();

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
                        $('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));
                        //console.log(adminLogeado);


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
                                        $scope.uf = 26594;



                                        var eventosAdmin = firebase.database().ref('/events').orderByChild('admin').equalTo(adminLogeado.$id);
                                        var eventsAdminRequest = $firebaseArray(eventosAdmin);
                                        eventsAdminRequest.$loaded().then(function () {

                                            $scope.eventosAFacturar = $filter('filter')(eventsAdminRequest, getPastEvent);
                                            if ($scope.eventosAFacturar.length == 0) {
                                             //no hay eventos pasados
                                            }
                                            if (eventsAdminRequest == undefined) {
                                              //no hay eventos
                                            }else {
                                                $scope.tickets = [];
                                                $scope.eventosAFacturar.forEach(function (event) {
                                                    event.deposito = 0;
                                                    event.izinait = 0;
                                                    var ticketServices = firebase.database().ref('/tickets/' + event.$id);
                                                    var ticketServiceRQ = $firebaseArray(ticketServices);
                                                    ticketServiceRQ.$loaded().then(function () {
                                                        ticketServiceRQ.forEach(function (ticketEvent) {
                                                            if(ticketEvent.pagoPuerta == false){
                                                                if(ticketEvent.paidOut == true){
                                                                    event.deposito += ticketEvent.totalAPagar;
                                                                    event.izinait +=  ticketEvent.totalAPagar *0.05+($scope.uf*0.01);
                                                                }

                                                            }


                                                        });
                                                    });

                                                });
                                            }

                                        });



                                    }
                                    ;
                                });
                            });

                        };
                        $('.tituloIziboss').text("Facturación");

                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                }
                ;

            });







            var getPastEvent = function (value, index, array) {
                // var currentDay = new Date().getTime();
                var date = new Date().getTime();
                // if (currentDay < value.toHour){
                if ($scope.eventosPasadosFecha < value.toHour) {


                        return true;

                }
                //}
                else
                    return false;
            };




        }]);