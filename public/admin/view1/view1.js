'use strict';

angular.module('myApp.view1', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
                templateUrl: 'view1/view1.html',
                controller: 'View1Ctrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }
        );
    }])


    .controller('View1Ctrl', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope', '$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $mdDialog) {


            var admin = window.currentAdmin;
            var adminLogeado = "";
            $scope.eventosFuturoFecha = new Date().getTime();
            $scope.eventsWithServices = [];


            $(sideEventos).addClass("active");
            $(crearEventos).removeClass("active");

            $(verEventosFuturos).addClass("active");
            $(verEventosPasados).removeClass("active");
            $(sideClientes).removeClass("active");
            $(sideRrpp).removeClass("active");
            $(sideDoorman).removeClass("active");
            $(contenido).css("padding-top", "30px ");
            $('.main-panel').perfectScrollbar('update');
            $('.smartbanner').addClass('hide');

            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);

                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        $('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));
                        //console.log(adminLogeado);

                        if (adminLogeado.idClubWork == false) {
                            //console.log("entreeeeeeeeeeeeeeeeeeeeeeeee");
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
                                    ;
                                });
                            });

                        }
                        ;
                        var eventosAdmin = firebase.database().ref('/events').orderByChild('admin').equalTo(adminLogeado.$id);
                        var eventsAdminRequest = $firebaseArray(eventosAdmin);
                        eventsAdminRequest.$loaded().then(function () {
                            $scope.Allvents = $filter('filter')(eventsAdminRequest, getFuturesEvents);
                            //console.log($scope.Allvents);
                            if ($scope.Allvents.length == 0) {
                                document.getElementById('noHayEventos').style.display = 'block';
                            }
                            if (eventsAdminRequest == undefined) {
                                $('.no-js').removeClass('nav-open');
                                //console.log("no cargo nada");
                                document.getElementById('noHayEventos').style.display = 'block';
                                $('.tituloIziboss').text("Eventos Futuros");
                            } else {
                                $('.no-js').removeClass('nav-open');
                                $scope.tickets = [];
                                $scope.Allvents.forEach(function (x) {
                                    var eventServices = firebase.database().ref('/eventServices/' + x.$id);
                                    var eventServicesRQ = $firebaseArray(eventServices);
                                    eventServicesRQ.$loaded().then(function () {
                                        x.reservas = eventServicesRQ;
                                        x.ReservaCantidad = eventServicesRQ.length;
                                        x.reservas.forEach(function (j) {
                                            j.utilizados = 0;
                                            var ticketServices = firebase.database().ref('/tickets/' + x.$id);
                                            var ticketServiceRQ = $firebaseArray(ticketServices);
                                            ticketServiceRQ.$loaded().then(function () {
                                                //console.log(ticketServiceRQ);
                                                $scope.tickets = ticketServiceRQ;
                                                $scope.tickets.forEach(function (k) {
                                                    if (j.$id == k.ideventservices) {
                                                        j.utilizados = j.utilizados + k.cantidadDeCompra;
                                                    }
                                                    ;
                                                });
                                            });
                                        });

                                        $scope.eventsWithServices.push(x);
                                        //console.log($scope.eventsWithServices);
                                    });
                                });


                            }
                            ;

                            document.getElementById('BarraCargando').style.display = 'none';
                            $('.tituloIziboss').text("Eventos Futuros");


                        });
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                }
                ;

            });


            var getFuturesEvents = function (value, index, array) {
                // var currentDay = new Date().getTime();
                var date = new Date().getTime();
                // if (currentDay < value.toHour){
                if ($scope.eventosFuturoFecha < value.toHour) {
                    if (Object.keys(value.clubs) == adminLogeado.idClubWork) {
                        console.log(Object.keys(value.clubs));
                        return true;
                    }
                }
                //}
                else
                    return false;
            };


            function dialogControllerSelecionarClub($scope, $mdDialog, $timeout, $q, $log, adminLogeadoRecibido, clubsCargados) {
                //console.log(clubsCargados);
                //console.log(adminLogeadoRecibido);
                $scope.clubs = clubsCargados;

                $scope.clubsSelecionados = [];

                $scope.selecionarClubs = function (club) {
                    club.selecionado = !club.selecionado;
                    //console.log($scope.clubs);
                };

                $scope.aceptarClub = function () {
                    $scope.clubs.forEach(function (x) {
                        if (x.selecionado == true) {
                            firebase.database().ref('admins/' + adminLogeadoRecibido.$id + '/clubs/' + x.$id).update(
                                {
                                    uid: x.$id,
                                    activoParaCrearEventos: true,
                                    validado: false,
                                    nombre: x.name
                                });

                        }
                        ;
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
                //console.log(adminLogeadoRecibido.clubs);

                if (adminLogeadoRecibido.clubs == undefined) {
                    var clubsCargados = [];
                    var clubsER = firebase.database().ref().child('clubs');
                    $scope.clubsER = $firebaseArray(clubsER);
                    $scope.clubsER.$loaded().then(function () {

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
                                clubsCargados: clubsCargados
                            }
                        });
                    });


                } else {
                    var clubsParaAdministrar = adminLogeadoRecibido.clubs;
                    $mdDialog.show({
                        controller: dialogControllerAdministrarClub,
                        templateUrl: 'dialogAdministrarClub',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        locals: {
                            adminLogeadoRecibido: adminLogeadoRecibido,
                            clubsParaAdministrar: clubsParaAdministrar
                        }
                    });
                }
            };

            function dialogControllerAdministrarClub($scope, $mdDialog, $timeout, $q, $log, adminLogeadoRecibido, clubsParaAdministrar) {
                //console.log(clubsParaAdministrar);
                //console.log(adminLogeadoRecibido);
                $scope.clubs = clubsParaAdministrar;

                $scope.administrarClub = function (club) {
                    //console.log(club);

                    firebase.database().ref('admins/' + adminLogeadoRecibido.$id).update(
                        {idClubWork: club.uid});
                    $('.clubSelecionado').text(club.nombre);
                    $mdDialog.hide();

                };

                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };


            $scope.goToEventDetails = function (evento) {
                document.location.href = '#!/detalleEvento?id=' + evento.$id;
            };

            $scope.verEvento = function (evento) {
                //document.location.href = 'https://izinait.com/app/#!/detalleEvento?id=' + evento.$id, '_blank';
                window.open('https://izinait.com/app/#!/detalleEvento?id=' + evento.$id, '_blank')
            };

            $scope.duplicateEvent = function (event) {
                $rootScope.eventToRepet = event;
                $rootScope.eventEdit = undefined;
                document.location.href = '#!/crearEvento';
            };

            $scope.editEvent = function (event) {
                $rootScope.eventEdit = event;
                $rootScope.eventToRepet = undefined;
                document.location.href = '#!/crearEvento';
            };


        }]);

