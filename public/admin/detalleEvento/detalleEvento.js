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

    .controller('detalleEventoCtrl', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $mdDialog) {



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
                        //$('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));

                        var rrppsAdmin = firebase.database().ref('admins/' + adminLogeado.$id  +'/rrpps');
                        var rrppsAdminRQ = $firebaseArray(rrppsAdmin);
                        rrppsAdminRQ.$loaded().then(function () {
                            ////console.log(rrppsAdminRQ);
                            $scope.rrppsAdminRQ = rrppsAdminRQ;
                        });

                        //$('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));
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
                                        $('.photo').prepend($('<img>', {id: 'theImg', src: x.clubLogo}));
                                        $(theImg).css("height", "-webkit-fill-available");
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
                    //////console.log(idRRPP);
                    return $filter('filter')($scope.rrppsAdminRQ,  {$id :rrppKey})[0].name;
                };


            };

            $scope.ventaManual = function (servicioEvent) {
                console.log(servicioEvent);

                $mdDialog.show({
                    controller: controllerDialogVentaManual,
                    templateUrl: 'dialogVentaManual',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        servicioEvent: servicioEvent,
                    }
                });
            };




            function controllerDialogVentaManual($scope, $mdDialog, $timeout, $q, $log,$http, servicioEvent) {

                $scope.servicioEvent = servicioEvent;
                console.log(eventId);
                console.log($scope.servicioEvent);
                $scope.cantidad = 1;
                $scope.newticket = {};


                $scope.masEntradas = function () {
                    if(  $scope.cantidad < $scope.servicioEvent.maxEntradas  ){
                        $scope.cantidad += 1;
                    }
                };

                $scope.menosEntradas = function () {
                    if( $scope.cantidad  > 1  ){
                        $scope.cantidad -= 1;
                    }

                };

                $scope.guardarEntradas = function () {





                    var ref = firebase.database().ref('/usersManual/');
                    var usersManual = $firebaseArray(ref);
                    usersManual.$loaded().then(function () {
                        var contador = 0;
                        var existe = false;
                        console.log(usersManual);
                        usersManual.forEach(function (usersManual) {
                            if(usersManual.email == $scope.correo){
                                $scope.nuevoClienteId = usersManual.$id;
                                existe = true;
                            };

                            contador +=1;
                        });

                        if(contador == usersManual.length){
                            console.log("hooola");
                            if(existe == true){
                                firebase.database().ref('usersManual/' + $scope.nuevoClienteId ).update({
                                    nombreCompleto: $scope.nombreCompleto,
                                    celular: $scope.wstp,
                                    email:  $scope.correo,
                                    rut:  $scope.rut,
                                });


                            }else{
                                $scope.nuevoClienteId = firebase.database().ref('usersManual/').push().key;
                                firebase.database().ref('usersManual/' + $scope.nuevoClienteId ).update({
                                    nombreCompleto: $scope.nombreCompleto,
                                    celular: $scope.wstp,
                                    email:  $scope.correo,
                                    rut:  $scope.rut,
                                });

                            }

                        }

                    });





                    $scope.newticket.cantidadDeCompra;
                    $scope.newticket.cantidadUtilizada;
                    $scope.newticket.celular;
                    $scope.newticket.date;
                    $scope.newticket.displayName;
                    $scope.newticket.email;
                    $scope.newticket.eventId;
                    $scope.newticket.firstName;
                    $scope.newticket.idTransaccion;
                    $scope.newticket.ideventservices;
                    $scope.newticket.lastName;
                    $scope.newticket.pagoPuerta;
                    $scope.newticket.paidOut;
                    $scope.newticket.redeemed;
                    $scope.newticket.rrppid;
                    $scope.newticket.ticketId;
                    $scope.newticket.tipoEventservices;
                    $scope.newticket.totalAPagar;
                    $scope.newticket.totalPagadoConComision;
                    $scope.newticket.userId;



                    console.log(adminLogeado);
                };






                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };



            var cargarUsuariosManual = function () {
    var ref = firebase.database().ref('/usersManual/');
    var usersManual = $firebaseObject(ref);
    usersManual.$loaded().then(function () {

    });

};

            $scope.shareWhatsappProductor = function () {
                var longUrl = eventUrl.evenUrl;
                var request = gapi.client.urlshortener.url.insert({
                    'resource': {
                        'longUrl': longUrl
                    }
                });
                request.execute(function (response) {

                    if (response.id != null) {
                        // //console.log(response.id+"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                        var shareWhatsapp = 'whatsapp://send?text=';
                        window.location.href = shareWhatsapp + response.id;

                    }
                    else {
                        alert("error: creating short url");
                    }

                });
            }



            var isMobile = {
                mobilecheck: function () {
                    return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent || navigator.vendor || window.opera) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent || navigator.vendor || window.opera).substr(0, 4)))
                }
            }

            $scope.onCellphone = isMobile.mobilecheck();





        }])
;



