/**
 * Created by andro on 24-07-2017.
 */

angular.module('myApp.detalleEvento', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/detalleEvento', {
            templateUrl: 'detalleEvento/detalleEvento.html',
            controller: 'detalleEventoCtrl'
        });
    }])

    .controller('detalleEventoCtrl', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope) {



            //$(eventos).addClass( "active" );
            //$(configuracion).removeClass( "active" );
            $('.tituloIziboss').text("Detalle Evento");
            $('.no-js').removeClass('nav-open');

            $(sideEventos).addClass("active");
            $(crearEventos).removeClass("active");

            $(verEventosFuturos).addClass("active");
            $(verEventosPasados).removeClass("active");
            $(sideClientes).removeClass("active");
            $(sideRrpp).removeClass("active");
            $(sideDoorman).removeClass("active");
            $(contenido).css("padding-top", "30px ");


            var admin = window.currentAdmin;
            var adminLogeado = "";
            var eventId = $routeParams.id; // id del evento entregador por url
            var event;
            $scope.totalListasGratis = 0;
            $scope.impresionesTotales = 0;

            var eventCargado = firebase.database().ref('/events/').child(eventId);
            var eventCargadoRQ = $firebaseObject(eventCargado);
            eventCargadoRQ.$loaded().then(function () {
                event = eventCargadoRQ;
                $scope.eventUrl = eventCargadoRQ;

            })



            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);

                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        $scope.adminLogeado =adminLogeado;
                        $('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));

                        var rrppsAdmin = firebase.database().ref('admins/' + adminLogeado.$id  +'/rrpps');
                        var rrppsAdminRQ = $firebaseArray(rrppsAdmin);
                        rrppsAdminRQ.$loaded().then(function () {
                            //console.log(rrppsAdminRQ);
                            $scope.rrppsAdminRQ = rrppsAdminRQ;
                        });

                        $('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));
                        if (adminLogeado.idClubWork == false) {
                            ObtenerClub(adminLogeado);
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
                                });
                            });

                            var serviciosEvent = firebase.database().ref('/eventServices/' + eventId);
                            var serviciosEventRQ = $firebaseArray(serviciosEvent);
                            var tickets = firebase.database().ref('/tickets/' + eventId);
                            var ticketsRQ = $firebaseArray(tickets);




                            ticketsRQ.$loaded().then(function () {
                                serviciosEventRQ.$loaded().then(function () {
                                    $.when($scope.ticketsEvent = ticketsRQ).then(function dtServicios() {
                                        $('#dtServicios').DataTable(

                                            {
                                                "pagingType": "simple_numbers"
                                                , "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Todos"]]
                                                ,

                                                responsive: true
                                                ,buttons: ['csv']
                                                , language: {
                                                search: "_INPUT_"
                                                , searchPlaceholder: "Buscar"
                                            }
                                            }
                                        )

                                    })
                                    $scope.serviciosEvent = serviciosEventRQ;
                                    $scope.serviciosEvent.forEach(function (j) {
                                        j.utilizados = 0;
                                        $scope.ticketsEvent.forEach(function (x) {

                                            if (x.ideventservices == j.$id) {
                                                j.utilizados = j.utilizados + x.cantidadDeCompra;

                                            }

                                        });
                                        /* angular.forEach(event.rrpps, function(rp){
                                         if (j.$id == rp.uid){
                                         j.nameRRPP = rp.name;
                                         $scope.impresionesTotales = $scope.impresionesTotales+ j.openLink;
                                         }
                                         });*/


                                    })

                                })
                            })


                            var listaGratis = firebase.database().ref('/events/' + eventId + '/asist');
                            var listaGratisRQ = $firebaseObject(listaGratis);
                            listaGratisRQ.$loaded().then(function () {
                                $.when($scope.listaGratis = listaGratisRQ).then(function dtListas() {
                                    $('#dtListas').DataTable(
                                        {
                                            "pagingType": "simple_numbers",
                                            "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
                                            responsive: true,
                                            language:
                                                {
                                                search: "_INPUT_",
                                                searchPlaceholder: "Buscar"
                                                },

                                        }
                                    )

                                })
                                $scope.listaGratis.forEach(function (x) {

                                    $scope.totalListasGratis = $scope.totalListasGratis + x.totalList;
                                });
                            });
                            $scope.datosTotalesRRPP = [];
                            $scope.sumaTicketsTotal = 0;
                            var impresiones = firebase.database().ref('/impresiones/' + eventId);
                            var impresionesRQ = $firebaseArray(impresiones);
                            impresionesRQ.$loaded().then(function () {
                                ticketsRQ.$loaded().then(function () {
                                    $scope.impresionesRRPP = impresionesRQ;
                                    angular.forEach(event.rrpps, function (rp) {
                                        if (rp.uid != 'noRRPP') {

                                            var rrpp = [];
                                            rrpp.listaTotal = 0;
                                            rrpp.openLink = 0;
                                            rrpp.ticketsTotal = 0;

                                            rrpp.nameRRPP = rp.name;

                                            $scope.listaGratis.forEach(function (x) {
                                                if (rp.uid == x.idRRPP) {
                                                    rrpp.listaTotal = rrpp.listaTotal + x.totalList;
                                                }
                                            });

                                            $scope.ticketsEvent.forEach(function (t) {
                                                if (rp.uid == t.rrppid) {
                                                    rrpp.ticketsTotal = rrpp.ticketsTotal + t.cantidadDeCompra;
                                                    $scope.sumaTicketsTotal = $scope.sumaTicketsTotal + t.cantidadDeCompra;
                                                }


                                            });

                                            $scope.impresionesRRPP.forEach(function (j) {
                                                if (j.$id == rp.uid) {
                                                    rrpp.openLink = j.openLink;
                                                    $scope.impresionesTotales = $scope.impresionesTotales + j.openLink;
                                                }
                                            });
                                            $scope.datosTotalesRRPP.push(rrpp);
                                        }
                                    })
                                })
                            })






                        }


                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                }


            })


            $scope.accionVisible = function (servicioEvent) {

                var ref = firebase.database().ref().child("/eventServices/" + eventId).child(servicioEvent.$id);
                ref.update({
                    visible: !servicioEvent.visible
                });
                servicioEvent.visible = !servicioEvent.visible;

                $scope.serviciosEvent.forEach(function (j) {
                    j.utilizados = 0;
                    $scope.ticketsEvent.forEach(function (x) {

                        if (x.ideventservices == j.$id) {
                            j.utilizados = j.utilizados + x.cantidadDeCompra;

                        }

                    });

                });

            };




            $scope.getNombreRRPP = function (idRRPP) {
                if (idRRPP) {
                    var rrppKey = idRRPP;
                    ////console.log(idRRPP);
                    return $filter('filter')($scope.rrppsAdminRQ,  {$id :rrppKey})[0].name;
                };


            };





        }])
;



