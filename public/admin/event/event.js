/**
 * Created by andro on 23-06-2017.
 */
'use strict';
angular.module('myApp.event', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/event', {
            templateUrl: 'event/event.html',
            controller: 'viewevent'
        });
    }])
    .controller('viewevent', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope', '$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $mdDialog) {


            var doorman = window.currentDoorman;
            var doormanLogeado = "";
            var rrppsCapturados = [];


            $scope.filtroVenta = true;
            $scope.filtroRrpp = false;
            $scope.filtroLista = false;
            var admin = window.currentAdmin;

            var adminLogeado = "";

            $scope.rrpps = [];
            var eventIdSelect = localStorage.getItem('eventIdSelect');
            //console.log(eventIdSelect);
            var eventId = $routeParams.id || eventIdSelect; // id del evento entregador por url
            var eventoCompleto = [];
            $scope.code = '';

            if ($routeParams.code) {
                $scope.code = $routeParams.code;
            }

            $('.tituloIziboss').text("Gestor Acceso");
            $('.no-js').removeClass('nav-open');


            $(contenido).css("padding-top", "0px");

            $(sideEventos).removeClass("active");
            $(crearEventos).removeClass("active");

            $(verEventosFuturos).removeClass("active");
            $(sideClientes).removeClass("active");
            $(sideRrpp).removeClass("active");
            $(sideDoorman).addClass("active");

            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);

                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        $('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));
                        ////console.log(adminLogeado);

                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                }
                ;

            });


            firebase.database().ref('events/').child(eventId).once('value', function (snapshot) {
                eventoCompleto = snapshot.val();
                //console.log(Object.keys(eventoCompleto.clubs)[0]);
            });


            $scope.url = 'zxing://scan/?ret=http://' + location.host + '/codigoRecibido.html?code={CODE}';


            firebase.database().ref('doormans/').child(doorman.$id || doorman.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);
                //console.log(exists);

                if (exists == true) {
                    var ref = firebase.database().ref('/doormans/').child(doorman.$id || doorman.uid);
                    var doormLocal = $firebaseObject(ref);
                    doormLocal.$loaded().then(function () {
                        doormanLogeado = doormLocal;
                        //console.log(doormanLogeado);

                        var listaGratis = $firebaseArray(firebase.database().ref('/events/' + eventId + '/asist'));
                        listaGratis.$loaded().then(function () {
                            $scope.AllListaGratis = listaGratis;
                            //console.log($scope.AllListaGratis);
                            $scope.listaGratis = $scope.AllListaGratis;

                            if ($scope.code != "") {
                                $scope.listaGratis = $filter('filter')($scope.AllListaGratis, {$id: $scope.code});
                                //console.log($scope.code);
                            };

                            var tickets = $firebaseArray(firebase.database().ref('/tickets/' + eventId));
                            tickets.$loaded().then(function () {
                                $scope.AllticketsObtenidos = tickets;

                                $scope.ticketsObtenidos = $scope.AllticketsObtenidos;

                                var rrpps = $firebaseArray(firebase.database().ref('/events/' + eventIdSelect + '/rrpps'));
                                rrpps.$loaded().then(function () {
                                    $scope.Allrrpps = rrpps
                                    $scope.rrpps = $scope.Allrrpps;
                                    calcularAsistenciasTotales();
                                });

                                if ($scope.code != "") {
                                    $scope.ticketsObtenidos = $filter('filter')($scope.AllticketsObtenidos, {userId: $scope.code});
                                    ////console.log($scope.code);
                                }
                                ;
                            });


                        });




                    });
                } else {
                    window.currentDoorman = "";
                    doormanLogeado = "";
                    //console.log(window.currentDoorman + " NO ENTRE");
                }
                ;

            });


            $scope.abrirLectorQr = function () {
                location.href = $scope.url;
            };


            $scope.verBoton = function (tab) {
                switch (tab) {
                    case 'tab1':
                        $scope.filtroVenta = true;
                        $scope.filtroRrpp = false;
                        $scope.filtroLista = false;
                        $('.main-panel').perfectScrollbar('update');
                        break;
                    case 'tab2':
                        $scope.filtroVenta = false;
                        $scope.filtroRrpp = true;
                        $scope.filtroLista = false;
                        $('.main-panel').perfectScrollbar('update');
                        break;
                    case 'tab3':
                        $scope.filtroVenta = false;
                        $scope.filtroRrpp = false;
                        $scope.filtroLista = true;
                        $('.main-panel').perfectScrollbar('update');
                        break;
                    default:
                }
            }

            $scope.filterEventsByText = function (filtro) {
                switch (filtro) {
                    case 'venta':
                        $scope.ticketsObtenidos = $filter('filter')($scope.AllticketsObtenidos, {displayName: $scope.filterVentaInput});
                        break;
                    case 'rrpp':
                        $scope.rrpps = $filter('filter')($scope.Allrrpps, {name: $scope.filterRrppInput});
                        break;
                    case 'lista':
                        $scope.listaGratis = $filter('filter')($scope.AllListaGratis, {displayName: $scope.filterListaInput});
                        break;
                    default:
                }
            }


            $scope.cobrarServicio = function (ticketObtenido) {
                var user = [];
                firebase.database().ref('users/').child(ticketObtenido.userId).once('value', function (snapshot) {
                    var exists = (snapshot.val() !== null);
                    if (exists) {
                        user = snapshot.val();

                    }
                    ;
                    if (ticketObtenido.cantidadUtilizada == ticketObtenido.cantidadDeCompra) {
                        swal({
                            title: "Cobrado!",
                            buttonsStyling: false,
                            confirmButtonClass: "btn btn-success"
                        });
                    } else {
                        $mdDialog.show({
                            controller: ControllerdialogCobrarServicio,
                            templateUrl: 'dialogCobrarServicio',
                            onComplete: function () {
                                $('._md').addClass('overflow');
                            },
                            parent: angular.element(document.body),
                            clickOutsideToClose: true,
                            locals: {
                                ticketObtenido: ticketObtenido,
                                user: user
                            }
                        });
                    }


                });


            };


            function ControllerdialogCobrarServicio($scope, $mdDialog, $timeout, $q, $log, ticketObtenido, user) {
                console.log(ticketObtenido);
                $scope.doormanLogeado = doormanLogeado;
                console.log(user);
                $scope.user = user;
                $scope.ticketObtenido = ticketObtenido;
                console.log($scope.ticketObtenido);
                $scope.precioIndividual = $scope.ticketObtenido.totalAPagar / $scope.ticketObtenido.cantidadDeCompra;
                $scope.ingresosRestantes = $scope.ticketObtenido.cantidadDeCompra - $scope.ticketObtenido.cantidadUtilizada;
                console.log($scope.precioIndividual);
                $scope.entradasHombre = 0;
                $scope.entradasMujer = 0;
                var tipoDePago;

                var fechaActual = new Date().getTime();
                var edadClient = ((fechaActual - (new Date(user.birthday).getTime())) / 31556926000);
                $scope.userEdad = Math.floor(edadClient);
                $scope.disminuirEntradasHombre = function (entradasHombre) {
                    if (entradasHombre == 0) {
                        console.log("no se puede disminiur mas");
                    } else {
                        console.log("funciona")
                        $scope.entradasHombre -= 1;
                    }
                };
                $scope.disminuirEntradasMujer = function (entradasMujer) {
                    if (entradasMujer == 0) {
                        console.log("no se puede disminiur mas");
                    } else {
                        console.log("funciona")
                        $scope.entradasMujer -= 1;
                    }

                };
                $scope.aumentarEntradasHombre = function (entradasHombre, entradasMujer) {
                    if (entradasHombre + entradasMujer < $scope.ingresosRestantes) {
                        console.log("funciona")
                        $scope.entradasHombre += 1;
                    } else {
                        console.log("no se puede aumentar mas ");
                    }

                };
                $scope.aumentarEntradasMujer = function (entradasHombre, entradasMujer) {
                    if (entradasHombre + entradasMujer < $scope.ingresosRestantes) {
                        console.log("funciona")
                        $scope.entradasMujer += 1;

                    } else {
                        console.log("no se puede aumentar mas ");
                    }

                };

                $scope.guardarEntrada = function () {
                    var total = $scope.ticketObtenido.cantidadUtilizada + $scope.entradasHombre + $scope.entradasMujer;
                    var nuevoIngreso = firebase.database().ref('tickets/' + eventId + '/' + $scope.ticketObtenido.$id + '/ingresos').push().key;

                    var idClub = Object.keys(eventoCompleto.clubs)[0];
                    var GuardarCliente = 'admins/' + eventoCompleto.admin + '/clients/' + idClub + '/' + $scope.ticketObtenido.userId;
                    firebase.database().ref(GuardarCliente).set(true);
                    firebase.database().ref('users/' + $scope.ticketObtenido.userId + '/events/' + eventoCompleto.admin + '/' + idClub + '/' + eventId).set(new Date().getTime());

                    if ($scope.ticketObtenido.paidOut) {
                        firebase.database().ref('tickets/' + eventId + '/' + $scope.ticketObtenido.$id).update({
                            cantidadUtilizada: total,
                            redeemed: true
                        });


                        firebase.database().ref('tickets/' + eventId + '/' + $scope.ticketObtenido.$id + '/ingresos/' + nuevoIngreso).update({
                            cantidadHombres: $scope.entradasHombre,
                            cantidadMujer: $scope.entradasMujer,
                            fechaIngreso: new Date().getTime(),
                            pagoTotal: 0,
                            medioDePago: 'pagado'

                        });

                        $mdDialog.hide();
                        calcularAsistenciasTotales();
                    } else {

                        firebase.database().ref('tickets/' + eventId + '/' + $scope.ticketObtenido.$id).update({
                            cantidadUtilizada: total,
                            redeemed: true
                        });
                        firebase.database().ref('tickets/' + eventId + '/' + $scope.ticketObtenido.$id + '/ingresos/' + nuevoIngreso).update({
                            cantidadHombres: $scope.entradasHombre,
                            cantidadMujer: $scope.entradasMujer,
                            fechaIngreso: new Date().getTime(),
                            pagoTotal: ($scope.entradasHombre + $scope.entradasMujer) * $scope.precioIndividual,
                            medioDePago: tipoDePago

                        });


                        $mdDialog.hide();
                        calcularAsistenciasTotales();
                    }


                };

                $scope.obtenerTipoDePago = function (tipoPagoSelecionado) {
                    if (tipoDePago == tipoPagoSelecionado) {
                        tipoDePago = "";
                        console.log(tipoDePago);
                    } else {
                        tipoDePago = tipoPagoSelecionado;
                        console.log(tipoDePago);
                    }
                    ;
                }

                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };
            /////////////////////dialog cobrar servicio

            // var element = document.querySelector('meta[property="og:image"]');
            // var content = element && element.getAttribute("content");

            function ControllerdialogAbrirCode($scope, $mdDialog, $timeout, $q, $log, code) {
                $scope.code = code;

            };

            $scope.borrarQr = function () {
                $scope.code = '';
                location.href = "#!/event";
            };

            $scope.AgregarPersonas = function (index, rrppSelect) {
                //console.log(index + "  " + rrppSelect);


                if(rrppSelect.uid == "noRRPP")
                {
                    index = "noRRPP";
                };


                $mdDialog.show({
                    controller: ControllerdialogAgregarPersonas,
                    templateUrl: 'dialogAgregarPersonas',
                    parent: angular.element(document.body),
                    onComplete: function () {
                        $('._md').addClass('cuadroRRPP');
                    },
                    clickOutsideToClose: true,
                    locals: {
                        rrppSelect: rrppSelect,
                        index: index
                    }
                });


            };

            // var element = document.querySelector('meta[property="og:image"]');
            // var content = element && element.getAttribute("content");

            function ControllerdialogAgregarPersonas($scope, $mdDialog, $timeout, $q, $log, rrppSelect, index) {
                if (index == 'noRRPP') {
                    $scope.rrppSelect = [];
                    $scope.rrppSelect.uid = 'noRRPP';

                    firebase.database().ref('events/' + eventId + '/rrpps/' + index).update({
                        name: 'Sin RR.PP',
                        uid: index,
                        email: 'sinrrpp@izinait.com'
                    });

                } else {
                    $scope.rrppSelect = rrppSelect;
                    $scope.rrppSelectElejido = rrppSelect;
                    console.log($scope.rrppSelectElejido);
                }
                ;
                //console.log(index);
                //console.log($scope.rrppSelect.uid);
                $scope.gratisHombre = 0;
                $scope.valorGratisHombre = 0;
                $scope.gratisMujer = 0;
                $scope.valorGratisMujer = 0;
                $scope.extraHombre = 0;
                $scope.valorExtraHombre = 0;
                $scope.extraMujer = 0;
                $scope.valorExtraMujer = 0;
                $scope.vipHombre = 0;
                $scope.valorVipHombre = 0;
                $scope.vipMujer = 0;
                $scope.valorVipMujer = 0;

                $scope.aumentargratisHombre = function (gratisHombre) {
                    if (gratisHombre >= 0) {
                        //console.log("funciona")
                        $scope.gratisHombre += 1;
                    }

                };

                $scope.disminuirgratisHombre = function (gratisHombre) {
                    if (gratisHombre == 0) {
                        //console.log("no se puede disminiur menos");
                    } else {
                        //console.log("funciona")
                        $scope.gratisHombre -= 1;
                    }
                };

                $scope.aumentargratisMujer = function (gratisMujer) {
                    if (gratisMujer >= 0) {
                        //console.log("funciona")
                        $scope.gratisMujer += 1;
                    }

                };

                $scope.disminuirgratisgratisMujer = function (gratisMujer) {
                    if (gratisMujer == 0) {
                        //console.log("no se puede disminiur menos");
                    } else {
                        //console.log("funciona")
                        $scope.gratisMujer -= 1;
                    }
                };

                $scope.aumentarExtraMujer = function (extraMujer) {
                    if (extraMujer >= 0) {
                        //console.log("funciona")
                        $scope.extraMujer += 1;
                    }

                };

                $scope.disminuirExtraMujer = function (extraMujer) {
                    if (extraMujer == 0) {
                        //console.log("no se puede disminiur menos");
                    } else {
                        //console.log("funciona")
                        $scope.extraMujer -= 1;
                    }
                };

                $scope.aumentarExtraHombre = function (extraHombre) {
                    if (extraHombre >= 0) {
                        //console.log("funciona")
                        $scope.extraHombre += 1;
                    }

                };

                $scope.disminuirExtraHombre = function (extraHombre) {
                    if (extraHombre == 0) {
                        //console.log("no se puede disminiur menos");
                    } else {
                        //console.log("funciona")
                        $scope.extraHombre -= 1;
                    }
                };

                $scope.aumentarVipHombre = function (vipHombre) {
                    if (vipHombre >= 0) {
                        //console.log("funciona")
                        $scope.vipHombre += 1;
                    }

                };

                $scope.disminuirVipHombre = function (vipHombre) {
                    if (vipHombre == 0) {
                        //console.log("no se puede disminiur menos");
                    } else {
                        //console.log("funciona")
                        $scope.vipHombre -= 1;
                    }
                };

                $scope.aumentarVipMujer = function (vipMujer) {
                    if (vipMujer >= 0) {
                        //console.log("funciona")
                        $scope.vipMujer += 1;
                    }

                };

                $scope.disminuirVipMujer = function (vipMujer) {
                    if (vipMujer == 0) {
                        //console.log("no se puede disminiur menos");
                    } else {
                        //console.log("funciona")
                        $scope.vipMujer -= 1;
                    }
                };


                $scope.guardar = function () {
                    var newIdPuerta = firebase.database().ref().child('ticketsCreate/').push().key;

                    var puertaTicket =
                        {
                            gratisHombre: $scope.gratisHombre,
                            valorGratisHombre: $scope.valorGratisHombre,
                            gratisMujer: $scope.gratisMujer,
                            valorGratisMujer: $scope.valorGratisMujer,
                            extraHombre: $scope.extraHombre,
                            valorExtraHombre: $scope.valorExtraHombre,
                            extraMujer: $scope.extraMujer,
                            valorExtraMujer: $scope.valorExtraMujer,
                            vipHombre: $scope.vipHombre,
                            valorVipHombre: $scope.valorVipHombre,
                            vipMujer: $scope.vipMujer,
                            valorVipMujer: $scope.valorVipMujer,
                            rrppId: $scope.rrppSelect.uid,
                            date: new Date().getTime()
                        };
                    //console.log(puertaTicket);

                    firebase.database().ref('events/' + eventId + '/puertaTickets/' + newIdPuerta).set(puertaTicket);

                    var rrppsCapturados = $firebaseObject(firebase.database().ref('events/' + eventIdSelect + '/rrpps'));
                    rrppsCapturados.$loaded().then(function () {
                        $scope.rrppsCapturado = rrppsCapturados;
                        $scope.rrppsCapturado.forEach(function (lk) {
                            if (lk.uid == $scope.rrppSelect.uid) {
                                if (!lk.numeroTotal) {
                                    lk.numeroTotal = 0;
                                }
                                //console.log(lk);
                                lk.numeroTotal =
                                    lk.numeroTotal +
                                    $scope.extraMujer +
                                    $scope.extraHombre +
                                    $scope.gratisHombre +
                                    $scope.gratisMujer +
                                    $scope.vipHombre +
                                    $scope.vipMujer
                                firebase.database().ref('events/' + eventId + '/rrpps/' + index).update(lk);
                            }
                            ;
                        });
                        $mdDialog.hide();
                        calcularAsistenciasTotales();
                    });

                };


                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };

            $scope.abrirListaGratis = function (userCapturado) {
                var user = [];
                //console.log(userCapturado);
                firebase.database().ref('users/').child(userCapturado.$id).once('value', function (snapshot) {
                    var exists = (snapshot.val() !== null);
                    if (exists) {
                        user = snapshot.val();
                    }
                    ;

                    $mdDialog.show({
                        controller: ControllerdialogAbrirListaGratis,
                        templateUrl: 'dialogAbrirListaGratis',
                        parent: angular.element(document.body),
                        onComplete: function () {
                            $('._md').addClass('overflow');
                        },
                        clickOutsideToClose: true,
                        locals: {
                            userCapturado: userCapturado,
                            user: user
                        }
                    });


                });


            };


            function ControllerdialogAbrirListaGratis($scope, $mdDialog, $timeout, $q, $log, userCapturado, user) {
                console.log(userCapturado);
                $scope.fechaFin = eventoCompleto.freemiumHour;
                $scope.doormanLogeado = doormanLogeado;
                console.log(user);
                $scope.user = user;
                $scope.userCapturado = userCapturado;
                //console.log($scope.userCapturado);
                $scope.entradasHombre = 0;
                $scope.entradasMujer = 0;

                var fechaActual = new Date().getTime();
                var edadClient = ((fechaActual - (new Date(user.birthday).getTime())) / 31556926000);
                $scope.userEdad = Math.floor(edadClient);

                $scope.disminuirEntradasHombre = function (entradasHombre) {
                    if (entradasHombre == 0) {
                        //console.log("no se puede disminiur mas");
                    } else {
                        //console.log("funciona")
                        $scope.entradasHombre -= 1;
                    }
                };
                $scope.disminuirEntradasMujer = function (entradasMujer) {
                    if (entradasMujer == 0) {
                        //console.log("no se puede disminiur mas");
                    } else {
                        //console.log("funciona")
                        $scope.entradasMujer -= 1;
                    }

                };
                $scope.aumentarEntradasHombre = function () {
                    //console.log("funciona")
                    $scope.entradasHombre += 1;


                };
                $scope.aumentarEntradasMujer = function () {
                    //console.log("funciona")
                    $scope.entradasMujer += 1;


                };

                $scope.guardarEntrada = function () {

                    var total = $scope.userCapturado.totalAsist + $scope.entradasHombre + $scope.entradasMujer;
                    console.log($scope.userCapturado);
                    var nuevoIngreso = firebase.database().ref('events/' + eventId + '/asist' + $scope.userCapturado.$id + '/ingresos').push().key;


                    firebase.database().ref('events/' + eventId + '/asist/' + $scope.userCapturado.$id).update({
                        totalAsist: total
                    });

                    firebase.database().ref('events/' + eventId + '/asist/' + $scope.userCapturado.$id + '/ingresos/' + nuevoIngreso).update({
                        cantidadHombres: $scope.entradasHombre,
                        cantidadMujer: $scope.entradasMujer,
                        fechaIngreso: new Date().getTime(),
                        gratis: true,

                    });

                    var idClub = Object.keys(eventoCompleto.clubs)[0];
                    var GuardarCliente = 'admins/' + eventoCompleto.admin + '/clients/' + idClub + '/' + $scope.userCapturado.$id;
                    firebase.database().ref(GuardarCliente).set(true);

                    firebase.database().ref('users/' + $scope.userCapturado.$id + '/events/' + eventoCompleto.admin + '/' + idClub + '/' + eventId).set(new Date().getTime());


                    $mdDialog.hide();

                    calcularAsistenciasTotales();
                };


                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };

            // var element = document.querySelector('meta[property="og:image"]');
            // var content = element && element.getAttribute("content");

            function ControllerdialogAbrirCode($scope, $mdDialog, $timeout, $q, $log, code) {
                $scope.code = code;

            };

            $scope.borrarQr = function () {
                $scope.code = '';
                location.href = "#!/event";
            };

            $scope.asistenciasTotales =0;
            var calcularAsistenciasTotales = function () {
                $scope.asistenciasTotales =0;
                 console.log($scope.listaGratis);
                console.log($scope.Allrrpps);   console.log($scope.ticketsObtenidos);

                $scope.listaGratis.forEach(function (x) {
                    $scope.asistenciasTotales += x.totalAsist;
                });

                $scope.Allrrpps.forEach(function (j) {
                    $scope.asistenciasTotales += j.numeroTotal;
                });
                $scope.ticketsObtenidos.forEach(function (d) {
                    $scope.asistenciasTotales += d.cantidadUtilizada;
                });


            };



        }]);



