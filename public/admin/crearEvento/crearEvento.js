angular.module('myApp.crearEvento', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/crearEvento', {
            templateUrl: 'crearEvento/crearEvento.html',
            controller: 'crearEventoCtrl'
        });
    }])

    .controller('crearEventoCtrl', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope', '$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $mdDialog) {


            $(sideEventos).addClass("active");
            $(crearEventos).addClass("active");
            $(verEventosFuturos).removeClass("active");
            $(verEventosPasados).removeClass("active");
            $(sideClientes).removeClass("active");
            $(sideRrpp).removeClass("active");
            $(sideDoorman).removeClass("active");


            var admin = window.currentAdmin;
            var adminLogeado = "";
            $scope.newEvent = {};

            $scope.eventEnvironmentSelect = true;
            $scope.musicGenresSelect = true;
            $scope.ageRangeFemale = true;
            $scope.ageRangeMale = true;
            $scope.clothing = true;

            $scope.serviciosEvent = [];


            var eventId = $routeParams.id ;

            if(eventId != null && eventId !="nuevoEvento"){

                firebase.database().ref('events/').child(eventId).once('value', function (snapshot) {
                    var event = snapshot.val();
                    //console.log(event);

                    $scope.eventEnvironmentSelect = false;
                    $scope.musicGenresSelect = false;
                    $scope.ageRangeFemale = false;
                    $scope.ageRangeMale = false;
                    $scope.clothing = false;

                        var eventServices = firebase.database().ref('/eventServices/' + event.id);
                        var eventServicesRQ = $firebaseArray(eventServices);
                        eventServicesRQ.$loaded().then(function () {
                            event.reservas = eventServicesRQ;
                            //console.log(event.reservas);
                            $scope.serviciosEvent = event.reservas;
                            $scope.serviciosEvent.forEach(function (serv) {
                                    serv.fechaFin = null;

                                if (serv.tipo == "Especial") {
                                    serv.color = "#ff9800";

                                }
                                ;
                                if (serv.tipo == "Preventa") {
                                    serv.color = "#f44336";
                                }
                                ;
                                if (serv.tipo == "Mesa") {
                                    serv.color = "#4caf50";
                                }
                                ;
                                if (serv.tipo == "Botella") {
                                    serv.color = "#00bcd4";
                                }
                                ;
                                if (serv.tipo == "Vip") {
                                    serv.color = "#c8c8c8";
                                }
                                ;


                            });

                            $scope.newEvent.eventDetails = event.eventDetails;
                            $scope.newEvent.djs = event.djs;
                            $scope.newEvent.name = event.name;
                            $scope.newEvent.entryValue = event.entryValue;

                            //console.log($scope.newEvent);
                            if (event.freemiumHour != event.date) {
                                $scope.activarHoraGratis = true;
                            };


                           document.getElementById("clothing").value = event.clothing;
                            $("#clothing").val(event.clothing);

                            $scope.newEvent.clothing = event.clothing;

                            $scope.newEvent.ageRangeFemale = event.ageRangeFemale;
                            $scope.newEvent.ageRangeMale = event.ageRangeMale;



                            $scope.newEvent.musicGenres =event.musicGenresSelect;
                            $scope.newEvent.eventEnvironment =event.eventEnvironmentSelect;
                            $scope.newEvent.eventEnvironmentSelect = event.eventEnvironmentSelect;
                            $scope.newEvent.musicGenresSelect = event.musicGenresSelect;

                                                });

                });

            };

            if ($rootScope.eventEdit != null) {

                location.href = "#!/crearEvento?id=" + $rootScope.eventEdit.$id;
                ;
                location.reload();

                $scope.serviciosEvent = $rootScope.eventEdit.reservas;
                $scope.serviciosEvent.forEach(function (serv) {

                    var myDate = new Date(serv.fechaFin);
                    serv.fechaFin = myDate.toGMTString();

                    if (serv.tipo == "Especial") {
                        serv.color = "#ff9800";

                    }
                    ;
                    if (serv.tipo == "Preventa") {
                        serv.color = "#f44336";
                    }
                    ;
                    if (serv.tipo == "Mesa") {
                        serv.color = "#4caf50";
                    }
                    ;
                    if (serv.tipo == "Botella") {
                        serv.color = "#00bcd4";
                    }
                    ;
                    if (serv.tipo == "Vip") {
                        serv.color = "#c8c8c8";
                    }
                    ;

                });

                if ($rootScope.eventEdit.freemiumHour != $rootScope.eventEdit.date) {
                    $scope.activarHoraGratis = true;
                }
                ;

                $scope.newEvent = $rootScope.eventEdit;


            }
            ;

            if ($rootScope.eventToRepet != null) {
                //console.log($rootScope.eventToRepet);
                 location.href = "#!/crearEvento?id=" + $rootScope.eventToRepet.$id;
                ;
                location.reload();
            }
            ;


            if ($rootScope.eventEdit == null && $rootScope.eventToRepet == null && eventId == null) {
                location.href = "#!/crearEvento?id=nuevoEvento";
                location.reload();

            }


            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);
                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
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
                                        $scope.nombreClubHtml = x.name;
                                        $('.clubSelecionado').text(x.name + " ");
                                        $scope.newEvent.city = x.city;
                                        $scope.newEvent.clubs = {};
                                        $scope.newEvent.clubs[x.$id] = true;
                                        $scope.newEvent.lat = x.latitude;
                                        $scope.newEvent.lng = x.longitude;
                                        $scope.newEvent.admin = adminLogeado.$id;
                                        $('.photo').prepend($('<img>', {id: 'theImg', src: x.clubLogo}));
                                        $(theImg).css("height", "-webkit-fill-available");

                                            $scope.newEvent.id = firebase.database().ref().child('events/').push().key;

                                        $scope.newEvent.evenUrl = 'https://izinait.com/detalleEvento?id=' + $scope.newEvent.id +"&friend="+$scope.newEvent.admin;
                                        $scope.newEvent.visible = adminLogeado.clubs[x.$id].validado;
                                        $scope.newEvent.descOutHour = 0;
                                        $scope.newEvent.premiumCover = 0;
                                        $scope.newEvent.freeCover = 0;
                                        $scope.newEvent.isPremiumEvent = false;
                                        $scope.newEvent.rrpps = [];
                                        angular.forEach(adminLogeado.rrpps, function (rp) {
                                            if (rp.bloqueado == true) {
                                                rp.numeroTotal = 0;
                                                $scope.newEvent.rrpps.push(rp);
                                            } else {
                                                if (Object.keys(rp.clubs).indexOf(adminLogeado.idClubWork) >= 0) {
                                                    rp.numeroTotal = 0;
                                                    $scope.newEvent.rrpps.push(rp);
                                                } else {
                                                    //console.log("rrpp no trabaja para este club")
                                                }
                                            }
                                            ;


                                        });


                                        $(".clubSelecionado").append("<b class='caret'> </b>");
                                    }
                                });
                            });

                        }
                        ;

                        $('.tituloIziboss').text("Crear Evento");
                        $('.no-js').removeClass('nav-open');
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                }
                ;

            });


            $scope.endDateBeforeRender = endDateBeforeRender;
            $scope.endDateOnSetTime = endDateOnSetTime;
            $scope.endDateOnSetTime1 = endDateOnSetTime1;
            $scope.startDateBeforeRender = startDateBeforeRender;
            $scope.startDateOnSetTime = startDateOnSetTime;

            function dtListas() {


                $("#valorEntrada").digits();
            }

            $.fn.digits = function () {
                return this.each(function () {
                    $(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                })
            }

            function startDateOnSetTime() {
                $scope.$broadcast('start-date-changed');
            }

            function endDateOnSetTime() {
                $scope.$broadcast('end-date-changed');
            }

            function endDateOnSetTime1() {
                $scope.$broadcast('end-date-changed');
            }

            function startDateBeforeRender($dates) {
                if ($scope.dateRangeEnd) {
                    //console.log(new Date($scope.dateRangeEnd).getTime());
                    //console.log(new Date($scope.dateRangeStart).getTime());
                    $scope.newEvent.fromHour = new Date($scope.dateRangeStart).getTime();
                    $scope.newEvent.toHour = new Date($scope.dateRangeEnd).getTime();
                    var activeDate = moment($scope.dateRangeEnd);

                    $dates.filter(function (date) {
                        return date.localDateValue() >= activeDate.valueOf()
                    }).forEach(function (date) {
                        date.selectable = false;
                    })
                }
            }

            function endDateBeforeRender($view, $dates) {


                if ($scope.dateRangeStart) {
                    var activeDate = moment($scope.dateRangeStart).subtract(1, $view).add(1, 'minute');

                    $dates.filter(function (date) {
                        return date.localDateValue() <= activeDate.valueOf()
                    }).forEach(function (date) {
                        date.selectable = false;
                    })
                }
            };

            var linkGuardarFoto;
            $('.dropzone').html5imageupload({
                onSave: function () {

                },
                onAfterCancel: function () {
                    $("#thumb").val('');
                },
                onAfterProcessImage: function () {
                    //console.log(this);
                    ////console.log(this.imageObj);
                    ////console.log(this.imageFinal(this.image[0]));


                    linkGuardarFoto = this.image[0].currentSrc;
                    ////console.log(linkGuardarFoto);

                    // Create a reference to 'mountains.jpg'
                    /*   */
                }
            });


            $scope.addNewChoicePREVENTA = function () {
                var newItemNo = $scope.PREVENTA;
                $scope.serviciosEvent.push({
                        tipo: "Preventa",
                        color: '#f44336'
                    }
                );
            };

            $scope.addNewChoiceMESA = function () {
                var newItemNo = $scope.MESA;
                $scope.serviciosEvent.push({
                        tipo: "Mesa",
                        color: '#4caf50'

                    }
                );
            };

            $scope.addNewChoiceBOTELLAS = function () {
                var newItemNo = $scope.BOTELLAS;
                $scope.serviciosEvent.push({
                        tipo: "Botella",
                        color: '#00bcd4'

                    }
                );
            };

            $scope.addNewChoiceVIP = function () {
                var newItemNo = $scope.VIP;
                $scope.serviciosEvent.push({
                        tipo: "Vip",
                        color: '#c8c8c8'
                    }
                );
            };

            $scope.addNewChoiceESPECIAL = function () {
                var newItemNo = $scope.ESPECIAL;
                $scope.serviciosEvent.push({
                        tipo: "Especial",
                        color: '#ff9800'
                    }
                );
            };


            $scope.removeChoice = function (index) {
                var lastItem = $scope.serviciosEvent.length - 1;
                $scope.serviciosEvent.splice(index,1);
            }


////////////////////////////// controla el pick image ////////////////////////


////////////////////////////////////////////////////////////////////////
            var environmentER = firebase.database().ref().child('environmentEvent');
            $scope.environmentER = $firebaseArray(environmentER);
            var clothingER = firebase.database().ref().child('clothing');
            $scope.clothingER = $firebaseArray(clothingER);
            var ageRangesER = firebase.database().ref().child('agerange');
            $scope.ageRangesER = $firebaseArray(ageRangesER);
            var musicsER = firebase.database().ref().child('styleEvent');
            $scope.musicsER = $firebaseArray(musicsER);

            $scope.environmentER.$loaded().then(function () {
                $scope.environments = $scope.environmentER;
            });
            $scope.clothingER.$loaded().then(function () {
                $scope.clothings = $scope.clothingER;
            });
            $scope.ageRangesER.$loaded().then(function () {
                $scope.ageRanges = $scope.ageRangesER;
            });
            $scope.musicsER.$loaded().then(function () {
                $scope.musics = $scope.musicsER;
            });

            $scope.allow3musicaGenres = function () {
                var options = $('.music-options');
                if ($scope.newEvent.musicGenres.length >= 3) {
                    angular.forEach(options, function (opt) {
                        var a = $(opt).attr('aria-selected');
                        if (a === 'false') {
                            $(opt).addClass('hidden');
                        }
                    });
                } else {
                    angular.forEach(options, function (opt) {
                        var a = $(opt).attr('aria-selected');
                        if (a === 'false') {
                            $(opt).removeClass('hidden');
                        }
                    });
                }
            };
            $scope.allowUpTo2Ambiente = function () {
                var options = $('.ambiente-option');
                if ($scope.newEvent.eventEnvironment.length >= 2) {
                    angular.forEach(options, function (opt) {
                        var a = $(opt).attr('aria-selected');
                        if (a === 'false') {
                            $(opt).addClass('hidden');
                        }
                    });
                } else {
                    angular.forEach(options, function (opt) {
                        var a = $(opt).attr('aria-selected');
                        if (a === 'false') {
                            $(opt).removeClass('hidden');
                        }
                    });
                }
            };

            $scope.grabarEvento = function () {
                var subir = true;
                var errorList = [];

                if (!$scope.newEvent.name) {
                    subir = false;
                    errorList.push("FALTA NOMBRE");
                }
                ;
                if (!linkGuardarFoto) {
                    subir = false;
                    errorList.push("FALTA IMAGEN");
                }
                ;
                if (!$scope.newEvent.fromHour) {
                    subir = false;
                    errorList.push("FALTA HORA DE INICIO");
                }
                ;
                if (!$scope.newEvent.toHour) {
                    subir = false;
                    errorList.push("FALTA HORA DE TERMINO");
                }
                ;
                if (!$scope.newEvent.eventDetails) {
                    subir = false;
                    errorList.push("FALTA DETALLE DE EVENTO");
                }
                ;
                if (!$scope.newEvent.ageRangeFemale) {
                    subir = false;
                    errorList.push("FALTA EDAD MUJER");
                }
                ;
                if (!$scope.newEvent.ageRangeMale) {
                    subir = false;
                    errorList.push("FALTA EDAD HOMBRE");
                }
                ;
                if (!$scope.newEvent.clothing) {
                    subir = false;
                    errorList.push("FALTA CODIGO DE VESTIMENTA");
                };

                if(!$scope.newEvent.djs){
                    errorList.push("FALTA lINE UP");
                };
                if(!$scope.newEvent.entryValue){
                    errorList.push("FALTA VALOR PUERTA");
                };

                if (!$scope.newEvent.eventEnvironmentSelect) {
                    subir = false;
                    errorList.push("FALTA AMBIENTE");
                } else {
                    if ($scope.newEvent.eventEnvironmentSelect.length > 2) {
                        errorList.push("SOLO PUEDES SELECIONAR UN MAXIMO DE 2 AMBIENTES");
                        subir = false;
                    }
                    ;
                }
                ;
                if (!$scope.newEvent.musicGenresSelect) {
                    subir = false;
                    errorList.push("FALTA ESTILO MUSICAL");
                } else {
                    if ($scope.newEvent.musicGenresSelect.length > 3) {
                        subir = false;
                        errorList.push("SOLO PUEDES SELECIONAR UN MAXIMO DE 3 ESTILOS MUSICALES");
                    };
                };

                if($scope.activarHoraGratis == true){
                    if($scope.newEvent.freemiumHour == undefined){
                        subir = false;
                        errorList.push("FALTA HORARIO LISTA GRATIS");
                    }
                }
                if($scope.activarCortesia == true){
                    if($scope.habilitarGenerales == true){
                        if($scope.newEvent.hourCortesiaGeneral== undefined){
                            subir = false;
                            errorList.push("FALTA HORARIO CORTESIA GENERAL");
                        }

                    }
                    if($scope.habilitarVip == true){
                        if($scope.newEvent.hourCortesiaVip== undefined){
                            subir = false;
                            errorList.push("FALTA HORARIO CORTESIA VIP");
                        }

                    }
                    if($scope.habilitarVipMesa == true){
                        if($scope.newEvent.hourCortesiaVipMesa == undefined){
                            subir = false;
                            errorList.push("FALTA HORARIO CORTESIA VIP MESA");
                        }

                    }

                }

                var NumeroDeServicio = 0;

                $scope.serviciosEvent.forEach(function (serv) {
                    NumeroDeServicio++;
                    if (!serv.precio) {
                        subir = false;
                        errorList.push("EL SERVICIO NUMERO " + NumeroDeServicio + " NO TIENE PRECIO ASIGNADO");
                    }
                    ;
                    if (!serv.cantidad) {
                        subir = false;
                        errorList.push("EL SERVICIO NUMERO " + NumeroDeServicio + " NO TIENE CANTIDAD DE CUPOS");
                    }
                    ;
                    if (!serv.maxEntradas) {
                        subir = false;
                        errorList.push("EL SERVICIO NUMERO " + NumeroDeServicio + " NO TIENE CANTIDAD DE COMPRAS POR USUARIO");
                    }
                    ;
                    if (!serv.desc) {
                        subir = false;
                        errorList.push("EL SERVICIO NUMERO " + NumeroDeServicio + " NO TIENE DESCRIPCION DEL SERVICIO");
                    }
                    ;
                    if (!serv.fechaFin) {
                        subir = false;
                        errorList.push("EL SERVICIO NUMERO " + NumeroDeServicio + " NO TIENE FECHA DE CIERRE DEL SERVICIO");
                    }
                    ;
                });


                //console.log(errorList);


if(errorList.length >0){

    var errores =   errorList ? errorList.join('. <br>') : '';

    swal({
        title: "Faltan los siguientes datos!",
        text: errores,
        buttonsStyling: true,
        confirmButtonClass: "btn btn-warning",
        type: "warning"
    });

}
                if (subir == true) {

                    if ($scope.activarHoraGratis == true) {
                        $scope.newEvent.freemiumHour = new Date($scope.newEvent.freemiumHour).getTime();
                    } else {
                        $scope.newEvent.freemiumHour = $scope.newEvent.fromHour;
                    };

                    if($scope.activarCoresia == false){
                        $scope.newEvent.hourCortesiaGeneral = $scope.newEvent.fromHour;
                        $scope.newEvent.hourCortesiaVip = $scope.newEvent.fromHour;
                        $scope.newEvent.hourCortesiaVipMesa = $scope.newEvent.fromHour;
                    }else{
                        if($scope.habilitarGenerales == true){
                            $scope.newEvent.hourCortesiaGeneral = new Date($scope.newEvent.hourCortesiaGeneral).getTime();
                        }else{
                            $scope.newEvent.hourCortesiaGeneral = $scope.newEvent.fromHour;
                        }
                        if($scope.habilitarVip == true){
                            $scope.newEvent.hourCortesiaVip = new Date($scope.newEvent.hourCortesiaVip).getTime();
                        }else {
                            $scope.newEvent.hourCortesiaVip = $scope.newEvent.fromHour;
                        }
                        if($scope.habilitarVipMesa == true){
                            $scope.newEvent.hourCortesiaVipMesa = new Date($scope.newEvent.hourCortesiaVipMesa).getTime();
                        }else{
                            $scope.newEvent.hourCortesiaVipMesa = $scope.newEvent.fromHour;
                        }
                    }



                    $scope.newEvent.date = $scope.newEvent.fromHour;


                    $scope.newEvent.policiesDoor =
                        'Hombres '
                        + $scope.newEvent.ageRangeMale
                        + ' | Mujeres '
                        + $scope.newEvent.ageRangeFemale
                        + ' | Dresscode '
                        + $scope.newEvent.clothing;

                    $scope.newEvent.ageRangeFemale = parseInt($scope.newEvent.ageRangeFemale);
                    $scope.newEvent.ageRangeMale =parseInt( $scope.newEvent.ageRangeMale);

                    $scope.newEvent.premiumHour = $scope.newEvent.freemiumHour;

                    $scope.newEvent.eventEnvironment = $scope.newEvent.eventEnvironmentSelect ? $scope.newEvent.eventEnvironmentSelect.join(', ') : '';
                    $scope.newEvent.musicGenres = $scope.newEvent.musicGenresSelect ? $scope.newEvent.musicGenresSelect.join(', ') : '';

                    console.log($scope.newEvent);

                  if ($scope.serviciosEvent.length > 0) {

                        document.getElementById('BarraCargando').style.display = 'block';
                        document.getElementById('crearEvento').style.display = 'none';
                       guardarServicios();
                        subirImagen();
                    } else {
                      subirImagen();
                      demo.showSwal('success-message');
                  }
                    ;
                }
                ;

                //console.log($scope.newEvent);


            };

            $scope.showSuccess = function (type) {
                swal({
                    title: "Exelente!",
                    text: "Tu evento ha sido creado exitosamente, pronto lo aprobaremos para ser visualizado en nuestras plataformas.!",
                    buttonsStyling: true,
                    confirmButtonClass: "btn btn-success",
                    type: "success"
                });
            }

            $scope.activarHoraGratisF = function () {
                //console.log($scope.newEvent.freemiumHour);
                !$scope.activarHoraGratis;
                if ($scope.activarHoraGratis == false) {
                    $scope.newEvent.freemiumHour = undefined;
                }
            };

            $scope.activarCortesias = function () {
                //console.log($scope.newEvent.freemiumHour);
                !$scope.activarCortesia;
                if ($scope.activarCortesia == false) {
                    $scope.newEvent.hourCortesiaGeneral = undefined;
                    $scope.newEvent.hourCortesiaVip = undefined;
                    $scope.newEvent.hourCortesiaVipMesa = undefined;
                }
            };
            $scope.activarCortesiasGenerales =function () {
                !$scope.habilitarGenerales;
                if ($scope.habilitarGenerales == false) {
                    $scope.newEvent.hourCortesiaGeneral = undefined;
                }

            };
            $scope.activarCortesiasVip =function () {
                !$scope.habilitarVip;
                if ($scope.habilitarVip == false) {
                    $scope.newEvent.hourCortesiaVip = undefined;
                }

            };
            $scope.activarCortesiasVipMesa =function () {
                !$scope.habilitarVipMesa;
                if ($scope.habilitarVipMesa == false) {
                    $scope.newEvent.hourCortesiaVipMesa = undefined;
                }

            };


            var guardarServicios = function () {
                if ("undefined" === typeof $scope.newEvent.id) {
                    //console.log("Omitir");
                } else {
                    //console.log("Guardando servicios para el evento: " + $scope.newEvent.id);

                    var tipoServicio = [];
                    //console.log($scope.serviciosEvent);
                    $scope.serviciosEvent.forEach(function (element, index, array) {
                        var service = {
                            tipo: element.tipo,
                            precio: element.precio,
                            cantidad: element.cantidad,
                            maxEntradas: element.maxEntradas,
                            desc: element.desc,
                            fechaFin: new Date(element.fechaFin).getTime(),
                            visible: true
                        };

                        tipoServicio.push(service);
                    });

                    var newPostKey = firebase.database().ref().child('events/' + $scope.newEvent.id + '/').push().key; //esto es solo para probar rapido
                    firebase.database().ref('eventServices/' + $scope.newEvent.id + '/').set(tipoServicio).then(
                        function (s) {
                            //console.log('se guardaron bien los servicios ', s);
                        }, function (e) {
                            alert('Error, intente de nuevo');
                            //console.log('se guardo mal ', e);
                        }
                    );
                }
            };


            /*  var ref = firebase.storage().ref('andro');
              ref.putString(message, 'data_url').then(function(snapshot) {
                  //console.log( snapshot.a.downloadURLs[0]);
                  //console.log('Uploaded a data_url string!');
              }); */
            var managerError = function (e) {
                stopLoading();
                //console.log('Hubo un Error', e);
                alert('Error interno, intente nuevamente.');
            };

            var subirImagen = function () {
                var file = linkGuardarFoto;  // URL DE LA IMAGEN
                var ref = firebase.storage().ref('eventImages/' + $scope.newEvent.id);  // RUTA DE DONDE SE GUARDARA
                ref.putString(file, 'data_url').then(function (snapshot) {
                    //console.log("guarde bien la imagen");
                    $scope.newEvent.image = snapshot.a.downloadURLs[0]; // url donde quedo el archivo guardado
                    firebase.database().ref('events/' + $scope.newEvent.id).set($scope.newEvent).then(
                        function (s) {
                            firebase.database().ref('clubs/' + adminLogeado.idClubWork + '/events/' + $scope.newEvent.id).set(true).then(
                                function (s) {

                                    updateDoormanEvents($scope.newEvent.id);
                                    //console.log("guerde bien todo el evento");

                                }, managerError);
                        }, managerError);
                }, managerError);
            };


            var updateDoormanEvents = function (eventId) {

                //console.log(eventId);

                firebase.database().ref('admins/' + adminLogeado.$id + '/events/' + $scope.newEvent.id).set(true);
                //console.log("guarde bien el events id en el administrador");
                //console.log("entro a guardar doormans");

                angular.forEach(adminLogeado.doormans, function (dr) {
                    if (dr.bloqueado == true) {
                        firebase.database().ref('doormans/' + dr.uid + '/events/' + $scope.newEvent.id).set(true);
                    } else {
                        if (Object.keys(dr.clubs).indexOf(adminLogeado.idClubWork) >= 0) {
                            firebase.database().ref('doormans/' + dr.uid + '/events/' + $scope.newEvent.id).set(true);
                        } else {
                            //console.log("doorman no trabaja para este club")
                        }
                    }
                    ;

                });

                angular.forEach(adminLogeado.rrpps, function (rp) {
                    if (rp.bloqueado == true) {
                        firebase.database().ref('rrpps/' + rp.uid + '/events/' + $scope.newEvent.id).set(true)
                    } else {
                        if (Object.keys(rp.clubs).indexOf(adminLogeado.idClubWork) >= 0) {
                            firebase.database().ref('rrpps/' + rp.uid + '/events/' + $scope.newEvent.id).set(true)
                        } else {
                            //console.log("rrpp no trabaja para este club")
                        }
                    }
                    ;

                });


                $scope.shareWithFacebook = 'https://www.facebook.com/share.php?u=' + $scope.newEvent.evenUrl;
                $scope.shareWithTwiter = 'https://twitter.com/share?text=An%20Awesome%20Link&url=' + $scope.newEvent.evenUrl;

                $scope.newEvent = {};


                if (adminLogeado.clubs[adminLogeado.idClubWork].validado) {
                    $scope.showConfirm(true);
                } else {
                    $scope.showConfirm(false);
                }
            };


            $scope.showConfirm = function (validado) {
                var text = "";
                if (validado) {
                    text = "IZINAIT YA APROBO TU EVENTO Y SE VISUALIZA EN NUESTRA WEB"
                } else {
                    text = "IZINAIT LO APROBARA EN UNOS MINUTOS"
                }

                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.confirm()
                    .title('EVENTO CARGADO EXITOSAMENETE')
                    .textContent(text)
                    .ariaLabel('Lucky day')
                    .ok('LISTO!!')

                $mdDialog.show(confirm).then(function () {
                    document.location.href = '#!/view1';

                }, function () {

                });
            };



            // funciones botones
            $scope.borrarMusicGenresSelect = function() {

                $scope.musicGenresSelect = true;
                $scope.newEvent.musicGenresSelect = undefined;

            };
            $scope.borrarEventEnvironmentSelect = function() {

                $scope.eventEnvironmentSelect = true;
                $scope.newEvent.eventEnvironmentSelect = undefined;
            };
            $scope.borrarEventAgeRangeFemale = function() {

                $scope.ageRangeFemale = true;
                $scope.newEvent.ageRangeFemale = undefined;
            };

            $scope.borrarEventAgeRangeMale = function() {

                $scope.ageRangeMale = true;
                $scope.newEvent.ageRangeMale = undefined;
            };
            $scope.borrarEventClothing = function() {

                $scope.clothing = true;
                $scope.newEvent.clothing = undefined;
            };



        }])
;