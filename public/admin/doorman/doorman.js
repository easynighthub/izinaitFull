'use strict';

angular.module('myApp.doorman', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/doorman', {
                templateUrl: 'doorman/doorman.html',
                controller: 'DoormanCtrl'
            }
        );
    }])


    .controller('DoormanCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope, $firebaseObject, $firebaseArray, $filter, $rootScope) {




            var doorman = window.currentDoorman;
            var doormanLogeado = "";
            $scope.allEvents = [];
            $scope.events = [];
            var eventIndex = 0;
            var currentDay = new Date().getTime();
            $('.tituloIziboss').text("Gestor Acceso");
            $('.no-js').removeClass('nav-open');
            $(contenido).css("padding-top", "30px ");

            var admin = window.currentAdmin;
            var adminLogeado = "";
            $scope.eventosFuturoFecha = new Date().getTime();
            $scope.eventsWithServices = [];


            $(sideEventos).removeClass("active");
            $(crearEventos).removeClass("active");

            $(verEventosFuturos).removeClass("active");
            $(sideClientes).removeClass("active");
            $(sideRrpp).removeClass("active");
            $(sideDoorman).addClass("active");
            $('.main-panel').perfectScrollbar('update');

            firebase.database().ref('doormans/').child(doorman.$id || doorman.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);

                if (exists == true) {
                    var ref = firebase.database().ref('/doormans/').child(doorman.$id || doorman.uid);
                    var doormLocal = $firebaseObject(ref);
                    doormLocal.$loaded().then(function () {
                        doormanLogeado = doormLocal;


                        var newEvent = firebase.database().ref('/events/').orderByChild('toHour').startAt(currentDay);
                        var newEventFB = $firebaseArray(newEvent);

                        if (doormanLogeado.events) {
                            $scope.eventsId = Object.keys(doormanLogeado.events);
                            console.log($scope.eventsId);

                            newEventFB.$loaded().then(function () {
                                $scope.allEvents = newEventFB;
                                $scope.allEvents.forEach(function (j) {
                                    $scope.eventsId.forEach(function (x) {
                                        if (j.$id == x) {
                                            $scope.events.push(j);
                                            console.log($scope.events);
                                        }
                                        ;
                                    });

                                });
                            });
                        } else {
                            alert("no tiene eventos asignado");
                        }


                    });
                } else {
                    window.currentDoorman = "";
                    doormanLogeado = "";
                    console.log(window.currentDoorman + " NO ENTRE");
                }
                ;

            });


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

            $scope.administrar = function (event) {
                localStorage.setItem("eventIdSelect", event.$id);
                location.href = "#!/event?id=" + event.$id;
            }

            var getFuturesEvents = function (value, index, array) {
                // var currentDay = new Date().getTime();
                var date = new Date().getTime();
                // if (currentDay < value.toHour){
                if ($scope.eventosFuturoFecha < value.toHour) {
                    if (Object.keys(value.clubs) == adminLogeado.idClubWork) {
                        return true;
                    }
                }
                //}
                else
                    return false;
            };


        }]);

