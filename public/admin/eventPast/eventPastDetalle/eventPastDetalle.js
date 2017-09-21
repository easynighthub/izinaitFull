/**
 * Created by andro on 24-07-2017.
 */

angular.module('myApp.detalleEventoPasado', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/eventPast/eventPastDetalle', {
            templateUrl: 'eventPast/eventPastDetalle/eventPastDetalle.html',
            controller: 'detalleEventoPasadoCtrl',
        });
    }])

    .controller('detalleEventoPasadoCtrl', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope) {



            //$(eventos).addClass( "active" );
            //$(configuracion).removeClass( "active" );
            $('.tituloIziboss').text("Informe Evento");
            $('.no-js').removeClass('nav-open');

            $(sideEventos).addClass("active");
            $(crearEventos).removeClass("active");

            $(verEventosFuturos).removeClass("active");
            $(verEventosPasados).addClass("active");
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
                event =eventCargadoRQ;
                             console.log(eventCargadoRQ);

            })

            $scope.eventQliao = eventCargadoRQ;

            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);

                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        $('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));

                        var rrppsAdmin = firebase.database().ref('events/' +  eventId +'/rrpps');
                        var rrppsAdminRQ = $firebaseArray(rrppsAdmin);
                        rrppsAdminRQ.$loaded().then(function () {
                            console.log(rrppsAdminRQ);
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
                            var listaGratis = firebase.database().ref('/events/' + eventId + '/asist');
                            var listaGratisRQ = $firebaseObject(listaGratis);

                            var impresiones = firebase.database().ref('/impresiones/' + eventId);
                            var impresionesRQ = $firebaseArray(impresiones);
                            var rrppsRQ = $firebaseArray(firebase.database().ref('/events/' + eventId + '/rrpps'));
                            var puerta = $firebaseArray(firebase.database().ref('/events/' + eventId + '/puertaTickets'));




                            $scope.datosTotalesRRPP = [];
                            $scope.sumaTicketsTotal = 0;
                            $scope.cantidadPuertaIngresos = 0;


                            ticketsRQ.$loaded().then(function () {
                                serviciosEventRQ.$loaded().then(function () {
                                    listaGratisRQ.$loaded().then(function () {
                                        impresionesRQ.$loaded().then(function () {
                                            rrppsRQ.$loaded().then(function () {
                                                puerta.$loaded().then(function () {
                                                    console.log(puerta);
                                                    $scope.puerta = puerta;

                                                    $scope.totalDineroServicios = 0;


                                                    $scope.Allrrpps = rrppsRQ;
                                                    $scope.impresionesRRPP = impresionesRQ;
                                                    $scope.serviciosEvent = serviciosEventRQ;
                                                    $scope.listaGratis = listaGratisRQ;
                                                    $scope.ticketsEvent = ticketsRQ;
                                                    $scope.rrpps = $scope.Allrrpps;

                                                $scope.listaGratis.forEach(function (x) {
                                                    $scope.totalListasGratis = $scope.totalListasGratis + x.totalAsist;
                                                });

                                                console.log($scope.datosTotalesRRPP);



                                                angular.forEach(event.rrpps, function (rp) {


                                                        var rrpp = [];
                                                        rrpp.listaTotal = 0;
                                                        rrpp.openLink = 0;
                                                        rrpp.ticketsTotal = 0;
                                                        rrpp.cantidadDeCheckIn =0;

                                                        rrpp.nameRRPP = rp.name;

                                                    rrpp.cantidadDePreventas = 0;
                                                    rrpp.cantidadDeMesas = 0;
                                                        $scope.listaGratis.forEach(function (x) {
                                                            if (rp.uid == x.idRRPP) {
                                                                console.log("hola");
                                                                rrpp.listaTotal = rrpp.listaTotal + x.totalAsist;
                                                                rrpp.cantidadDeCheckIn += x.totalAsist;
                                                            }
                                                        });

                                                        $scope.ticketsEvent.forEach(function (t) {
                                                            if (rp.uid == t.rrppid) {
                                                                if(t.tipoEventservices == 'Mesa'){
                                                                    rrpp.cantidadDeMesas += t.cantidadDeCompra;
                                                                }
                                                                if(t.tipoEventservices == 'Preventa'){
                                                                    rrpp.cantidadDePreventas += t.cantidadDeCompra;
                                                                }
                                                                rrpp.ticketsTotal = rrpp.ticketsTotal + t.cantidadDeCompra;


                                                                if(t.paidOut){
                                                                    rrpp.cantidadDeCheckIn +=  t.cantidadDeCompra;
                                                                    $scope.sumaTicketsTotal = $scope.sumaTicketsTotal + t.cantidadDeCompra;
                                                                }else{
                                                                    rrpp.cantidadDeCheckIn +=  t.cantidadUtilizada;
                                                                    $scope.sumaTicketsTotal = $scope.sumaTicketsTotal + t.cantidadUtilizada;
                                                                };
                                                            };
                                                        });

                                                        angular.forEach(event.puertaTickets , function (puerta) {
                                                            if( rp.uid  == puerta.rrppId ){
                                                                var total = 0;
                                                                total = puerta.extraHombre +
                                                                        puerta.extraMujer +
                                                                        puerta.gratisHombre +
                                                                        puerta.gratisMujer +
                                                                        puerta.vipHombre  +
                                                                        puerta.vipMujer;

                                                                rrpp.cantidadDeCheckIn += total;
                                                                $scope.cantidadPuertaIngresos += total;



                                                            };


                                                        });

                                                        $scope.impresionesRRPP.forEach(function (j) {
                                                            if (j.$id == rp.uid) {
                                                                rrpp.openLink = j.openLink;
                                                                $scope.impresionesTotales = $scope.impresionesTotales + j.openLink;
                                                            }
                                                        });
                                                        $scope.datosTotalesRRPP.push(rrpp);

                                                });




                                    $scope.ticketUtilizados = 0;
                                    $scope.serviciosEvent.forEach(function (j) {
                                        j.utilizados = 0;
                                        $scope.ticketsEvent.forEach(function (x) {

                                            if (x.ideventservices == j.$id) {
                                                j.utilizados = j.utilizados + x.cantidadDeCompra;
                                                $scope.totalDineroServicios += x.totalAPagar;
                                                if(x.cantidadUtilizada > 0){
                                                    $scope.ticketUtilizados += 1;
                                                };
                                            }

                                        });



                                    });



                                            });
                                            });
                                        });
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







            $scope.getNombreRRPP = function (idRRPP) {
                if (idRRPP) {
                    var rrppKey = idRRPP;
                    ////console.log(idRRPP);
                    return $filter('filter')($scope.rrppsAdminRQ,  {uid :rrppKey})[0].name;
                };


            };







        }])
;



