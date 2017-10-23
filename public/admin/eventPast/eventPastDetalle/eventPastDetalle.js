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
                             //console.log(eventCargadoRQ);

            })

            $scope.eventQliao = eventCargadoRQ;

            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);

                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        //$('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));

                        var rrppsAdmin = firebase.database().ref('events/' +  eventId +'/rrpps');
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
                            var listaGratis = firebase.database().ref('/events/' + eventId + '/asist');
                            var listaGratisRQ = $firebaseObject(listaGratis);

                            var impresiones = firebase.database().ref('/impresiones/' + eventId);
                            var impresionesRQ = $firebaseArray(impresiones);
                            var rrppsRQ = $firebaseArray(firebase.database().ref('/events/' + eventId + '/rrpps'));
                            var puerta = $firebaseArray(firebase.database().ref('/events/' + eventId + '/puertaTickets'));
                            var usersRQ = $firebaseArray(firebase.database().ref('/users/'));


                            $scope.datosTotalesRRPP = [];
                            $scope.sumaTicketsTotal = 0;
                            $scope.cantidadPuertaIngresos = 0;


                            ticketsRQ.$loaded().then(function () {
                                serviciosEventRQ.$loaded().then(function () {
                                    listaGratisRQ.$loaded().then(function () {
                                        impresionesRQ.$loaded().then(function () {
                                            rrppsRQ.$loaded().then(function () {
                                                puerta.$loaded().then(function () {
                                                    usersRQ.$loaded().then(function () {
                                                    //console.log(puerta);
                                                    $scope.puerta = puerta;

                                                    $scope.totalDineroServicios = 0;


                                                    $scope.Allrrpps = rrppsRQ;
                                                    $scope.impresionesRRPP = impresionesRQ;
                                                    $scope.serviciosEvent = serviciosEventRQ;
                                                    $scope.listaGratis = listaGratisRQ;
                                                    $scope.ticketsEvent = ticketsRQ;
                                                    $scope.users = usersRQ;
                                                    $scope.rrpps = $scope.Allrrpps;
                                                    $scope.checkInTotales = 0;
                                                    $scope.clientes = [];

                                                    $scope.contadorEdades = 0;
                                                    $scope.contadorPersonasEdades = 0;

                                                        var fechaActual = new Date().getTime();


                                                        angular.forEach(Object.keys($scope.listaGratis), function (gratis) {

                                                            $scope.users.forEach(function (user) {
                                                                if(gratis == user.$id){
                                                                    console.log(gratis);
                                                                    console.log(user.$id);


                                                                   var edadClient = ((fechaActual - (new Date(user.birthday).getTime())) / 31556926000);
                                                                    $scope.contadorEdades += edadClient;
                                                                    $scope.contadorPersonasEdades += 1;

                                                                }

                                                            });
                                                        });

                                                $scope.listaGratis.forEach(function (x) {

                                                    $scope.totalListasGratis = $scope.totalListasGratis + x.totalAsist;
                                                    //console.log( Object.keys(x));
                                                    //console.log(x.ingresos);
                                                    var ultimoIngreso = 0;
                                                    if(x.ingresos){
                                                        angular.forEach(x.ingresos,function (ingreso) {
                                                            ultimoIngreso = ingreso.fechaIngreso;
                                                        });
                                                    }
                                                  var cliente = {
                                                        nombre : x.displayName,
                                                        reserva : 0,
                                                        gratis : x.totalAsist,
                                                        checkIn :ultimoIngreso,
                                                        rrpp :x.idRRPP

                                                }
                                                if(ultimoIngreso != 0){
                                                    $scope.clientes.push(cliente);
                                                }


                                                });

                                                //console.log($scope.datosTotalesRRPP);



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
                                                                //console.log("hola");
                                                                rrpp.listaTotal = rrpp.listaTotal + x.totalAsist;
                                                                rrpp.cantidadDeCheckIn += x.totalAsist;
                                                                $scope.checkInTotales += x.totalAsist;

                                                            }
                                                        });

                                                        $scope.ticketsEvent.forEach(function (t) {

                                                            if(t.tipoEventservices == 'Preventa')
                                                            {
                                                                //console.log(t);
                                                            }

                                                            if (rp.uid == t.rrppid) {
                                                                if(t.tipoEventservices == 'Mesa'){
                                                                    rrpp.cantidadDeMesas += t.cantidadDeCompra;
                                                                }
                                                                if(t.tipoEventservices == 'Preventa'){
                                                                    rrpp.cantidadDePreventas += t.cantidadDeCompra;
                                                                }

                                                                $scope.users.forEach(function (user) {
                                                                    if(t.$id == user.$id){
                                                                        var edadClient = ((fechaActual - (new Date(user.birthday).getTime())) / 31556926000);
                                                                        $scope.contadorEdades += edadClient;
                                                                        $scope.contadorPersonasEdades += 1;

                                                                    }

                                                                });

                                                                if(t.paidOut){


                                                                    rrpp.cantidadDeCheckIn +=  t.cantidadDeCompra;
                                                                    $scope.checkInTotales += t.cantidadDeCompra;
                                                                    $scope.sumaTicketsTotal +=  t.cantidadDeCompra;
                                                                    rrpp.ticketsTotal = rrpp.ticketsTotal + t.cantidadDeCompra;

                                                                    var ultimoIngreso = 0;
                                                                    if(t.ingresos){
                                                                        angular.forEach(t.ingresos,function (ingreso) {
                                                                            ultimoIngreso = ingreso.fechaIngreso;
                                                                        });
                                                                    }
                                                                  var cliente = {
                                                                        nombre : t.displayName,
                                                                        reserva : t.cantidadDeCompra,
                                                                        gratis : 0,
                                                                        checkIn :ultimoIngreso,
                                                                        rrpp :t.rrppid

                                                                    }
                                                                    if(ultimoIngreso != 0){
                                                                        $scope.clientes.push(cliente);
                                                                    }

                                                                }else{
                                                                    rrpp.cantidadDeCheckIn +=  t.cantidadUtilizada;
                                                                    $scope.checkInTotales += t.cantidadUtilizada;
                                                                    $scope.sumaTicketsTotal += t.cantidadUtilizada;
                                                                    rrpp.ticketsTotal = rrpp.ticketsTotal + t.cantidadUtilizada;


                                                                    var ultimoIngreso = 0;
                                                                    if(t.ingresos){
                                                                        angular.forEach(t.ingresos,function (ingreso) {
                                                                            ultimoIngreso = ingreso.fechaIngreso;
                                                                        });
                                                                    }
                                                                    var cliente = {
                                                                        nombre : t.displayName,
                                                                        reserva : t.cantidadUtilizada,
                                                                        gratis : 0,
                                                                        checkIn :ultimoIngreso,
                                                                        rrpp :t.rrppid

                                                                    }
                                                                    if(ultimoIngreso != 0){
                                                                        $scope.clientes.push(cliente);
                                                                    }
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
                                                                $scope.checkInTotales += total;

                                                                $scope.cantidadPuertaIngresos += total;

                                                                var conCobro = puerta.extraHombre +
                                                                    puerta.extraMujer +
                                                                    puerta.vipHombre  +
                                                                    puerta.vipMujer;
                                                                var sinCobro = puerta.gratisHombre +
                                                                    puerta.gratisMujer;



                                                                var totalExtra = (puerta.extraHombre*puerta.valorExtraHombre)
                                                                    +(puerta.extraMujer*puerta.valorExtraMujer);
                                                                    var TotalVip = (puerta.vipHombre*puerta.valorVipHombre)
                                                                        +(puerta.vipMujer*puerta.valorVipMujer);

                                                                $scope.totalDineroServicios += TotalVip+totalExtra;

                                                                var cliente = {
                                                                    nombre : "SIN NOMBRE",
                                                                    reserva : conCobro,
                                                                    gratis : sinCobro,
                                                                    checkIn :puerta.date,
                                                                    rrpp :puerta.rrppId

                                                                }
                                                                $scope.clientes.push(cliente);


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
                                        //console.log("tipo de servicio")
                                        j.utilizados = 0;
                                        $scope.ticketsEvent.forEach(function (x) {

                                            if (x.ideventservices == j.$id) {
                                                if(x.paidOut  == true)
                                                {
                                                    j.utilizados = j.utilizados += x.cantidadDeCompra;

                                                    $scope.totalDineroServicios += x.totalAPagar;
                                                    if(x.cantidadUtilizada > 0){
                                                        $scope.ticketUtilizados += 1;
                                                    };
                                                }else{
                                                    j.utilizados = j.utilizados += x.cantidadUtilizada;
                                                    $scope.totalDineroServicios += x.totalAPagar;
                                                    if(x.cantidadUtilizada > 0){
                                                        $scope.ticketUtilizados += 1;
                                                    };

                                                }

                                            }

                                        });


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
                    //////console.log(idRRPP);
                    return $filter('filter')($scope.rrppsAdminRQ,  {uid :rrppKey})[0].name;
                };


            };



            var dataPreferences = {
                labels: ['45%', '55%'],
                series: [450, 132]
            };

            var optionsPreferences = {
                height: '230px'
            };



            var chartPreferences = new Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
            md.startAnimationForLineChart(chartPreferences);



        }])
;



