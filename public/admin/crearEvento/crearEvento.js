angular.module('myApp.crearEvento', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/crearEvento', {
            templateUrl: 'crearEvento/crearEvento.html',
            controller: 'crearEventoCtrl'
        });
    }])

    .controller('crearEventoCtrl', ['$scope', '$routeParams','$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope,$routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope) {



            $(eventos).addClass( "active" );
            $(configuracion).removeClass( "active" );


            var admin = window.currentAdmin;
            var adminLogeado = "";
            $scope.newEvent = {};


            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        if(adminLogeado.idClubWork == false){
                            ObtenerClub (adminLogeado);
                        }else{
                            var clubNombreMostrar = [];
                            var clubNombre = firebase.database().ref().child('clubs');
                            $scope.clubNombre = $firebaseArray(clubNombre);
                            $scope.clubNombre.$loaded().then(function() {

                                clubNombreMostrar = $scope.clubNombre;
                                clubNombreMostrar.forEach(function (x) {
                                    if(x.$id == adminLogeado.idClubWork){
                                        $('.clubSelecionado').text(x.name +" ");
                                        $scope.newEvent.city = x.city;
                                        $scope.newEvent.clubs = {};
                                        $scope.newEvent.clubs[x.$id] = true;
                                        $scope.newEvent.lat = x.latitude;
                                        $scope.newEvent.lng = x.longitude;
                                        $scope.newEvent.admin = adminLogeado.$id;
                                        $scope.newEvent.id =  firebase.database().ref().child('events/').push().key;
                                        $scope.newEvent.evenUrl = 'http://izinait.com/user/app/#!/detalleEvento?id=' + $scope.newEvent.id;
                                        console.log(adminLogeado.clubs[x.$id].validado);
                                        $scope.newEvent.visible = adminLogeado.clubs[x.$id].validado;
                                        $scope.newEvent.descOutHour = 0;
                                        $scope.newEvent.premiumCover = 0;
                                        $scope.newEvent.freeCover = 0;
                                        $scope.newEvent.isPremiumEvent = false;
                                        $scope.newEvent.rrpps =[];
                                        console.log(adminLogeado.rrpps);
                                        angular.forEach(adminLogeado.rrpps,function (rp) {
                                            if(rp.bloqueado == true){
                                                $scope.newEvent.rrpps.push(rp);
                                            }else{
                                                if(Object.keys(rp.clubs).indexOf(adminLogeado.idClubWork) >= 0){
                                                    $scope.newEvent.rrpps.push(rp);
                                                }else {
                                                    console.log("rrpp no trabaja para este club")
                                                }
                                            };


                                        });





                                        $( ".clubSelecionado" ).append( "<b class='caret'> </b>" );
                                    }
                                });
                            });

                        };
                        console.log(adminLogeado);

                        $('.tituloIziboss').text("Crear Evento");
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                };

            });

            $scope.endDateBeforeRender = endDateBeforeRender;
            $scope.endDateOnSetTime = endDateOnSetTime;
            $scope.endDateOnSetTime1 = endDateOnSetTime1;
            $scope.startDateBeforeRender = startDateBeforeRender;
            $scope.startDateOnSetTime = startDateOnSetTime;

            function startDateOnSetTime () {
                $scope.$broadcast('start-date-changed');
            }

            function endDateOnSetTime () {
                $scope.$broadcast('end-date-changed');
            }
            function endDateOnSetTime1 () {
                $scope.$broadcast('end-date-changed');
            }
            function startDateBeforeRender ($dates) {
                if ($scope.dateRangeEnd) {
                    console.log(new Date($scope.dateRangeEnd).getTime());
                    console.log(new Date($scope.dateRangeStart).getTime());
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

            function endDateBeforeRender ($view, $dates) {
                if ($scope.dateRangeStart) {
                    var activeDate = moment($scope.dateRangeStart).subtract(1, $view).add(1, 'minute');

                    $dates.filter(function (date) {
                        return date.localDateValue() <= activeDate.valueOf()
                    }).forEach(function (date) {
                        date.selectable = false;
                    })
                }
            };



            function     readURL(input) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $scope.imageInBase64 = e.target.result;
                        $('#blah').attr('src', e.target.result);
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            };

            $("#imgInp").change(function () {
                readURL(this);
            });

            $scope.serviciosEvent = [];

            $scope.addNewChoicePREVENTA = function () {
                var newItemNo = $scope.PREVENTA;
                $scope.serviciosEvent.push({
                        tipo: "PREVENTA",
                        color: '#f44336'

                    }
                );
            };

            $scope.addNewChoiceMESA = function () {
                var newItemNo = $scope.MESA;
                $scope.serviciosEvent.push({
                        tipo: "MESA",
                        color: '#4caf50'
                    }
                );
            };

            $scope.addNewChoiceBOTELLAS = function () {
                var newItemNo = $scope.BOTELLAS;
                $scope.serviciosEvent.push({
                        tipo: "BOTELLAS",
                        color: '#00bcd4'
                    }
                );
            };

            $scope.addNewChoiceVIP = function () {
                var newItemNo = $scope.VIP;
                $scope.serviciosEvent.push({
                        tipo: "VIP",
                        color: '#c8c8c8'
                    }
                );
            };

            $scope.addNewChoiceESPECIAL = function () {
                var newItemNo = $scope.ESPECIAL;
                $scope.serviciosEvent.push({
                        tipo: "ESPECIAL",
                        color: '#ff9800'
                    }
                );
            };



            $scope.removeChoice = function () {
                var lastItem = $scope.serviciosEvent.length - 1;
                $scope.serviciosEvent.splice(lastItem);
            };


            ////////////////////////////// controla el pick image ////////////////////////

            $(".dropzone").html5imageupload({
                onAfterProcessImage: function() {
                    $eventImage.val($(this.element).data("name")),
                        $(".cover-container").parent().parent().removeClass("has-error"),
                        coverIsFalse = !1,
                        $("#checkCover").removeClass("checkRequired")
                },
                onAfterCancel: function() {
                    $("#checkCover").addClass("checkRequired"),
                        coverIsFalse = !0
                },
                onAfterRemoveImage: function() {
                    $("#checkCover").addClass("checkRequired"),
                        coverIsFalse = !0
                }
            });
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

                if ($scope.activarHoraGratis == true) {
                    $scope.newEvent.freemiumHour = new Date($scope.newEvent.freemiumHour).getTime();
                } else {
                    $scope.newEvent.freemiumHour = $scope.newEvent.fromHour;
                }

                $scope.newEvent.date = $scope.newEvent.fromHour;
                $scope.newEvent.policiesDoor =
                    'Hombres '
                    + $scope.newEvent.ageRangeMale
                    + ' | Mujeres '
                    + $scope.newEvent.ageRangeFemale
                    + ' | Dresscode '
                    + $scope.newEvent.clothing;

                $scope.newEvent.premiumHour = $scope.newEvent.freemiumHour;


                $scope.newEvent.eventEnvironment = $scope.eventEnvironment ? $scope.eventEnvironment.join(', ') : '';
                $scope.newEvent.musicGenres = $scope.newEvent.musicGenres ? $scope.newEvent.musicGenres.join(', ') : '';

                if($scope.serviciosEvent.length > 0){
                    guardarServicios();
                    subirImagen();
                }else{
                    subirImagen();
                };

                console.log($scope.newEvent);


            };

            $scope.activarHoraGratisF = function () {
                console.log($scope.newEvent.freemiumHour);
                !$scope.activarHoraGratis;
               if($scope.activarHoraGratis == false){
                   $scope.newEvent.freemiumHour = undefined;
               }


            };


            var guardarServicios = function () {
                if ("undefined" === typeof $scope.newEvent.id) {
                    console.log("Omitir");
                } else {
                    console.log("Guardando servicios para el evento: " + $scope.newEvent.id);

                    var tipoServicio = [];
                    console.log($scope.serviciosEvent);
                    $scope.serviciosEvent.forEach(function (element, index, array) {
                        var service = {
                            tipo: element.tipo,
                            precio: element.precio,
                            cantidad: element.cantidad,
                            maxEntradas: element.maxEntradas,
                            desc: element.desc,
                            fechaFin: new Date(element.fechaFin).getTime()
                        };

                        tipoServicio.push(service);
                    });

                  var newPostKey = firebase.database().ref().child('events/' + $scope.newEvent.id + '/').push().key; //esto es solo para probar rapido
                    firebase.database().ref('eventServices/' + $scope.newEvent.id + '/').set(tipoServicio).then(
                        function (s) {
                            console.log('se guardaron bien los servicios ', s);
                        }, function (e) {
                            alert('Error, intente de nuevo');
                            console.log('se guardo mal ', e);
                        }
                    );
                }
            };
            var subirImagen = function ()  {
                var file = $('#imgInp')[0].files[0];   // URL DE LA IMAGEN
                var ref = firebase.storage().ref('eventImages/' + $scope.newEvent.id + '/' + file.name);  // RUTA DE DONDE SE GUARDARA EN FACEBOOK
                ref.put(file).then(function (snapshot) {
                    console.log("guarde bien la imagen");
                    $scope.newEvent.image = snapshot.a.downloadURLs[0]; // url donde quedo el archivo guardado
                    firebase.database().ref('events/' + $scope.newEvent.id).set($scope.newEvent).then(
                        function (s) {
                            firebase.database().ref('clubs/' + getclubId($scope.selectedClub) + '/events/' + $scope.newEvent.id).set(true).then(
                                function (s) {

                                    updateDoormanEvents($scope.newEvent.id);
                                    console.log("guerde bien todo el evento");

                                }, managerError);
                        }, managerError);
                }, managerError);
            };


            var updateDoormanEvents = function (eventId) {

                console.log(eventId);

                firebase.database().ref('admins/' + adminLogeado.$id + '/events/' + $scope.newEvent.id).set(true);
                console.log("guarde bien el events id en el administrador");
                console.log("entro a guardar doormans");

                angular.forEach(adminLogeado.doormans,function (dr) {
                    if(dr.bloqueado == true){
                        firebase.database().ref('doormans/' + dr.uid + '/events/' + $scope.newEvent.id).set(true);
                    }else{
                        if(Object.keys(dr.clubs).indexOf(adminLogeado.idClubWork) >= 0){
                            firebase.database().ref('doormans/' + dr.uid + '/events/' + $scope.newEvent.id).set(true);
                        }else {
                            console.log("doorman no trabaja para este club")
                        }
                    };

                });

                angular.forEach(adminLogeado.rrpps,function (rp) {
                    if(rp.bloqueado == true){
                        firebase.database().ref('rrpps/' + rp.uid + '/events/' + $scope.newEvent.id).set(true)
                    }else{
                        if(Object.keys(rp.clubs).indexOf(adminLogeado.idClubWork) >= 0){
                            firebase.database().ref('rrpps/' + rp.uid + '/events/' + $scope.newEvent.id).set(true)
                        }else {
                            console.log("rrpp no trabaja para este club")
                        }
                    };

                });

                $scope.shareWithFacebook = 'https://www.facebook.com/share.php?u=' + $scope.newEvent.evenUrl;
                $scope.shareWithTwiter = 'http://twitter.com/share?text=An%20Awesome%20Link&url=' + $scope.newEvent.evenUrl;

                alert('EVENTO CARGADO EXITOSAMENETE , izinait lo aprobara en unos minutos');
                $scope.newEvent = {};
                document.location.href = '#!/view1';
            };


        }]);