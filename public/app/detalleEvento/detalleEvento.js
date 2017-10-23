'use strict';


angular.module('myApp.detalleEvento', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        var URLactual =location.href.split('#!/')[1];
        $routeProvider.when('/detalleEvento', {
            templateUrl: 'detalleEvento/detalleEvento.html',
            controller: 'viewdetalleEvento',
            data: {
                meta: {
                    'url': 'https://izinait.com/'+URLactual
                }
            }
        });
    }])
    .controller('viewdetalleEvento', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope', '$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $mdDialog) {

            var user = window.currentApp;
            var usuarioLogeado = "";
            $scope.userQvoRQ = "";

            var oContainer = $("#contact-buttons-bar");
            // Make the buttons visible
            setTimeout(function () {
                oContainer.animate({left: 0});
            }, 200);

            var eventId = $routeParams.id; // id del evento entregador por url
            var friendId = $routeParams.friend; // id del rrpp o amigo que compartio el evento
            var Rrpp = friendId || 'MD18DcCzYMXPhOQb8U61bWfgzRg2'; //rrpp selecionado

            firebase.database().ref('users/').child(user.$id || user.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);
                //console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/users/').child(user.$id || user.uid);
                    var usersLocal = $firebaseObject(ref);
                    var buscarme = firebase.database().ref('/events/' + eventId + '/asist');
                    var buscarmeRequest = $firebaseArray(buscarme);

                    usersLocal.$loaded().then(function () {
                        usuarioLogeado = usersLocal;
                        //console.log(usuarioLogeado);

                        $scope.confirmarCorreo(usuarioLogeado);

                        $('.nombreUsuario').text(usuarioLogeado.displayName);
                        //  $('.user-header .imagen').text(usersLocal.picture);
                        $('.codigoAcceder').text("Tú Codigo");
                        //console.log(window.currentApp + " ENTRE");


                        var userQvo = firebase.database().ref('/userQvo/').child( usuarioLogeado.$id);
                        var userQvoRQ = $firebaseObject(userQvo);
                        userQvoRQ.$loaded().then(function () {
                            //console.log(userQvoRQ);
                            $scope.userQvoRQ = userQvoRQ;
                        });


                        buscarmeRequest.$loaded().then(function () {
                            $scope.buscarmeEnEvent = buscarmeRequest;
                            //console.log($scope.buscarmeEnEvent);
                            buscarme.once("value").then(function (snapshot) {
                                $scope.buscarmeEnEvent.forEach(function (data) {
                                    var c = snapshot.child(usuarioLogeado.$id).exists(); // true
                                    if (c === true) {
                                        var Rrpp = data.$id;
                                        var totalAsist = firebase.database().ref('/events/' + eventId + '/asist/'  + usuarioLogeado.$id);
                                        var totalAsistRrequest = $firebaseObject(totalAsist);
                                        totalAsistRrequest.$loaded().then(function () {
                                            $scope.datosAsistire = totalAsistRrequest;
                                            $scope.siExisto = +1
                                            if ($scope.siExisto > 0) {
                                                document.getElementById('botonAsistir').style.display = 'none';
                                                $scope.verSelectList = false;
                                                //document.getElementById('selectLista').style.display = 'none';
                                                document.getElementById('botonLista').style.display = 'block';
                                            }
                                        });
                                    }
                                    ;
                                });
                            });

                        });
                    });
                } else {
                    firebase.auth().signOut();
                    window.currentApp = "";
                    usuarioLogeado = "";
                    $('.nombreUsuario').text("BIENVENIDO");
                    $('.codigoAcceder').text("acceder");
                    //console.log(window.currentApp + " NO ENTRE");
                }
                ;
            });

            /////
            $scope.cargarImage=function () {
                document.getElementById('contenedor').style.marginLeft('0px');
                document.getElementById('contenedor').style.width('100%');

            };


            $scope.shareButtonFacebook = function () {
                var longUrl = 'https://izinait.com/detalleEvento?id=' + eventId + '&friend=' + Rrpp;
                var request = gapi.client.urlshortener.url.insert({
                    'resource': {
                        'longUrl': longUrl
                    }
                });
                request.execute(function (response) {

                    if (response.id != null) {
                        // //console.log(response.id+"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                        var sharefacebook = 'https://www.facebook.com/sharer/sharer.php?app_id=1138664439526562&sdk=joey&u=';

                        window.open(sharefacebook + response.id, '_blank');


                    }
                    else {
                        alert("error: creating short url");
                    }

                });
            }

            $scope.shareButtonTw = function () {
                var longUrl = 'https://izinait.com/detalleEvento?id=' + eventId + '&friend=' + Rrpp;
                var request = gapi.client.urlshortener.url.insert({
                    'resource': {
                        'longUrl': longUrl
                    }
                });
                request.execute(function (response) {

                    if (response.id != null) {
                        // //console.log(response.id+"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                        var sharetw = 'http://twitter.com/home?status=';


                        window.open(sharetw + response.id, '_blank');


                    }
                    else {
                        alert("error: creating short url");
                    }

                });
            }

            $scope.shareButtonWhatsapp = function () {
                var longUrl = 'https://izinait.com/detalleEvento?id=' + eventId + '&friend=' + Rrpp;
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
            //console.log($scope.onCellphone);


            $scope.borrar = function (eventService) {

            }
            /////


            // capturar datos de firebase
            var clubsER = $firebaseArray(firebase.database().ref().child('clubs'));


            var getEvent = $firebaseObject(firebase.database().ref().child('events/' + eventId));
            getEvent.$loaded().then(function () {
                //console.log(getEvent);
                $scope.event = getEvent;


                window.fbAsyncInit = function() {
                    FB.init({
                        appId      : '1138664439526562',
                        xfbml      : true,
                        version    : 'v2.8'
                    });
                    FB.AppEvents.logPageView();
                    FB.api(
                        "/id_from_create_call",
                        "POST",
                        {
                            "object": "{\"fb:app_id\":\"1138664439526562\",\"og:type\":\"article\",\"og:url\":\"https://izinait.com\",\"og:title\":\"Sample Article\",\"og:image\":\"https:\\\/\\\/s-static.ak.fbcdn.net\\\/images\\\/devsite\\\/attachment_blank.png\"}"
                        },
                        function (response) {
                            if (response && !response.error) {
                                /* handle the result */
                            }
                        }
                    );
                };

                (function(d, s, id){
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {return;}
                    js = d.createElement(s); js.id = id;
                    js.src = "//connect.facebook.net/es_LA/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));


                document.getElementById('BarraCargando').style.display = 'none';
                document.getElementById('detalleEvento').style.display = 'block';
            });


            //funciones
            var obtenerUsuario = function (user) {

            };

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            // Define the container for the buttons
            var oContainer = $("#contact-buttons-bar");

            // Make the buttons visible
            setTimeout(function () {
                oContainer.animate({left: 0});
            }, 200);

            // Show/hide buttons
            $('body').on('click', '.show-hide-contact-bar', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $('.show-hide-contact-bar').find('.fa').toggleClass('fa-angle-right fa-angle-left');
                oContainer.find('.cb-ancor').toggleClass('cb-hidden');
            });

////////////////////////////////////////////////////////////////////////////

            //funciones
            $scope.getClub = function (club) {
                if (club) {
                    var clubKey = Object.keys(club)[0];
                    return $filter('filter')(clubsER, {$id: clubKey})[0].name;
                }
            };
            $scope.getDireccionClub = function (club) {
                if (club) {
                    var clubKey = Object.keys(club)[0];
                    return $filter('filter')(clubsER, {$id: clubKey})[0].address;
                }
            };


            // guardar impreciones de un amigo o de un rrpp que compartio izinait o simplemente de izinait
            var impresionesContador = firebase.database().ref('/impresiones/' + eventId + '/' + Rrpp + '/openLink');
            var impresionesContadorRQ = $firebaseObject(impresionesContador);
            impresionesContadorRQ.$loaded().then(function () {
                $scope.contadorTotal = impresionesContadorRQ;
                // //console.log($scope.contadorTotal.$value);
                $scope.contadorTotal.$value++;
                ////console.log($scope.contadorTotal.$value);
                var impresionesRRPP = firebase.database().ref('/impresiones/' + eventId + '/' + Rrpp + '/').update({
                    openLink: $scope.contadorTotal.$value
                });

            });


            $scope.editarListaGratis = function () {
                document.getElementById('botonAsistir').style.display = 'block';
                $scope.verSelectList = true;
                //document.getElementById('selectLista').style.display = 'block';
                document.getElementById('botonLista').style.display = 'none';
            };
            $scope.totalReserva = 1;

            $scope.aumentarLista = function () {
                if($scope.totalReserva < 10){
                    $scope.totalReserva +=1;
                }

            };
            $scope.disminuirLista = function () {
                if( $scope.totalReserva>1){
                    $scope.totalReserva -=1;
                }

            };

            $scope.guardarListaGratis = function () {
                $scope.nuevaAsistencia = {};
                $scope.nuevaAsistencia.asistencia = false;
                $scope.nuevaAsistencia.fechaClick = Date.now();
                $scope.nuevaAsistencia.totalList = $scope.totalReserva;
                $scope.nuevaAsistencia.totalAsist = 0;
                $scope.nuevaAsistencia.displayName = usuarioLogeado.displayName;
                $scope.nuevaAsistencia.email = usuarioLogeado.email;
                $scope.nuevaAsistencia.idRRPP = Rrpp;
                $scope.nuevaAsistencia.tipo = "general";
                $scope.nuevaAsistencia.fechaCaducacion = $scope.event.freemiumHour;
                $scope.nuevaAsistencia.userFacebook = true;
                $scope.nuevaAsistencia.cortesia = false;
                $scope.nuevaAsistencia.id = usuarioLogeado.$id;

                var totalAsistenciaVisible = $scope.totalReserva;


                if (usuarioLogeado != "") {
                    guardarListaGratisFuncion(totalAsistenciaVisible);
                } else {
                    $mdDialog.show({
                        controller: dialogControllerAccederConFacebook,
                        templateUrl: 'dialogAccederConFacebook',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        locals: {
                            eventsService: "hola",
                        }
                    });
                }


            };

            function guardarListaGratisFuncion(total) {
                firebase.database().ref('events/' + eventId + '/asist/' + usuarioLogeado.$id).update($scope.nuevaAsistencia);
                document.getElementById('botonAsistir').style.display = 'none';

                $scope.verSelectList = false;
                //document.getElementById('selectLista').style.display = 'none';
                document.getElementById('botonLista').style.display = 'block';
                $scope.datosAsistire = {};
                $scope.datosAsistire.totalList = total;

            }

            var serviciosCapturados = firebase.database().ref('/eventServices/').child(eventId);
            var objDeServicios = $firebaseArray(serviciosCapturados);
            var tickets = firebase.database().ref('/tickets/' + eventId );
            var ticketsRQ = $firebaseArray(tickets);
            objDeServicios.$loaded().then(function () {
                ticketsRQ.$loaded().then(function () {
                    $scope.ticketsEvent = ticketsRQ;
                    $scope.allEventsService = objDeServicios;
                    $scope.allEventsService.forEach(function (k) {
                        k.totalComprados = 0;
                        $scope.ticketsEvent.forEach(function (j) {
                            if(k.$id == j.ideventservices){
                                k.totalComprados =  k.totalComprados + j.cantidadDeCompra;
                            };
                        });
                        k.id = k.$id;

                    });


             //obj;
                //console.log($scope.allEventsService);
            });
            });

           var  dialogAdquirirServicio = function(eventsService){
               $scope.dialogAdquirirServicio(eventsService);
           };
            $scope.dialogAdquirirServicio = function (eventsService) {

                if (usuarioLogeado == "") {

                    $mdDialog.show({
                        controller: dialogControllerAccederConFacebook,
                        templateUrl: 'dialogAccederConFacebook',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        locals: {
                            eventsService: eventsService,
                        }
                    });
                } else {
                    $mdDialog.show({
                        controller: dialogControllerAdquirirServicio,
                        templateUrl: 'dialogAdquirirServicio',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        locals: {
                            eventsService: eventsService,
                            userQvoRQ:$scope.userQvoRQ
                        }
                    });

                }


            };
            function dialogControllerAccederConFacebook($scope, $mdDialog, $timeout, $q, $log, eventsService) {
                var eventsService = eventsService;

                var token;
                $scope.usuarioLogeado = usuarioLogeado;

                $scope.IngresarConFacebook = function () {

                    var USERS_LOCATION = 'users/';
                    var database = firebase.database();
                    var provider = new firebase.auth.FacebookAuthProvider();


                    //se agrega el permiso de cumpleaños
                    provider.addScope('user_birthday');
                    provider.addScope('email');
                    provider.addScope('public_profile');


                    firebase.auth().signInWithPopup(provider).then(function (result) {

                        // This gives you a Google Access Token. You can use it to access the Google API.
                        token = result.credential.accessToken;
                        // The signed-in user info.
                        user = result.user;
                        //console.log(token);
                        //console.log(user);
                        firebase.auth().onAuthStateChanged(onAuthStateChanged);
                    }).catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // The email of the user's account used.
                        var email = error.email;
                        // The firebase.auth.AuthCredential type that was used.
                        var credential = error.credential;
                    });

                    function writeUserData(response) {
                        database
                            .ref(USERS_LOCATION + user.uid)
                            .update({
                                displayName: response.name,
                                email: response.email || "null@izinait.com",
                                picture: response.picture.data.url,
                                provider: provider,
                                type: 'Free',
                                age: response.age_range.min,
                                birthday: response.birthday || "11/11/1111",
                                firstName: response.first_name,
                                facebookId: response.id,
                                lastName: response.last_name,
                                gender: response.gender
                            });
                    };
                    function    updateData(response) {
                        database
                            .ref(USERS_LOCATION + user.uid)
                            .update({
                                displayName: response.name,
                                picture: response.picture.data.url,
                                firstName: response.first_name,
                                lastName: response.last_name,
                            });
                    };

                    function onAuthStateChanged(user) {
                        //cleanupUi();
                        if (user) {
                            FB.api('/me', 'get',
                                {
                                    access_token: token,
                                    fields: 'id, name, email, first_name, last_name, age_range{min}, picture.type(large), birthday, gender'
                                },
                                function (response) {
                                    checkIfUserExists(user.uid, response);
                                });
                        } else {
                            // Display the splash page where you can sign-in.
                        }
                    }

                    function userExistsCallback(exists, response) {
                        if (exists) {

                            writeUserData(response);
                            //console.log(response);
                            //console.log("obtuve el codigo");


                            $scope.nombre = firebase.auth().currentUser.displayName;

                            var ref = firebase.database().ref('/users/').child(user.uid);
                            var usersLocal = $firebaseObject(ref);
                            usersLocal.$loaded().then(function () {
                                window.currentApp = usersLocal;
                                $scope.usuarioLogeado = usersLocal;
                                usuarioLogeado = usersLocal;
                                $scope.nombre = $scope.usuarioLogeado.displayName;
                                $scope.email = $scope.usuarioLogeado.email;
                                $scope.foto = $scope.usuarioLogeado.picture;
                                $scope.email = $scope.usuarioLogeado.email;

                                $scope.confirmarCorreo($scope.usuarioLogeado);

                                $('.nombreUsuario').text($scope.usuarioLogeado.displayName);
                                $('.codigoAcceder').text("Tú Codigo");
                                //console.log("obvtuve la foto y el correo");
                                $mdDialog.hide();

                                location.reload();
                                //dialogAdquirirServicio(eventsService);


                            });


                        } else {
                            updateData(response);
                            //console.log(firebase.auth().currentUser);
                            // obtengo codigo

                            $scope.nombre = firebase.auth().currentUser.displayName;

                            var ref = firebase.database().ref('/users/').child(user.uid);
                            var usersLocal = $firebaseObject(ref);
                            usersLocal.$loaded().then(function () {
                                window.currentApp = usersLocal;
                                $scope.usuarioLogeado = usersLocal;
                                usuarioLogeado = usersLocal;
                                $scope.nombre = $scope.usuarioLogeado.displayName;
                                $scope.email = $scope.usuarioLogeado.email;
                                $scope.foto = $scope.usuarioLogeado.picture;
                                $scope.email = $scope.usuarioLogeado.email;

                                $scope.confirmarCorreo($scope.usuarioLogeado);

                                $('.nombreUsuario').text($scope.usuarioLogeado.displayName);
                                $('.codigoAcceder').text("Tú Codigo");
                                //console.log("obvtuve la foto y el correo");
                                $mdDialog.hide();
                                location.reload();
                                //$scope.dialogAdquirirServicio(eventsService);


                            });
                        }
                    }

                    // Tests to see if /users/<userId> has any data.
                    function checkIfUserExists(userId, response) {
                        var usersRef = database.ref(USERS_LOCATION);
                        usersRef.child(userId).once('value', function (snapshot) {
                            var exists = (snapshot.val() !== null);
                            //console.log(exists);
                            userExistsCallback(exists, response);
                        });
                    }
                };


                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


                window.fbAsyncInit = function () {
                    FB.init({
                        appId: '1138664439526562',
                        xfbml: true,
                        version: 'v2.8'
                    });
                    FB.AppEvents.logPageView();
                };

                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {
                        return;
                    }
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "//connect.facebook.net/es_LA/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));

                $scope.confirmarCorreo = function (user) {

                    if(user.email == "null@izinait.com"){
                        // Appending dialog to document.body to cover sidenav in docs app
                        var confirm = $mdDialog.prompt()
                            .title('Confirmanos tu correo')
                            .textContent('Recuerda colocar un correo valido')
                            .placeholder('Correo Electronico')
                            .ariaLabel('Correo Electronico')
                            .initialValue('')
                            .ok('Confirmar!')
                            .cancel('');
                        $mdDialog.show(confirm).then(function(result) {



                            var usersTodos = firebase.database().ref('/users/');
                            var usersTodosRQ = $firebaseArray(usersTodos);
                            usersTodosRQ.$loaded().then(function () {

                                //console.log(usersTodosRQ);
                                var contador = 0;
                                var existe = false;
                                angular.forEach(usersTodosRQ, function (usersRecorridos) {
                                    if (usersRecorridos.email == result) {
                                        existe = true;
                                    }
                                    ;
                                    contador += 1;
                                    //console.log(contador + " es igual a " + usersTodosRQ.length);

                                });

                                if (contador == usersTodosRQ.length) {
                                    if (existe != true) {
                                        //console.log("no existe este correo");
                                        firebase.database().ref('users/' + user.$id).update({
                                            email: result
                                        });
                                        location.reload();

                                    } else {
                                        alert("este correo ya existe");
                                        location.reload();
                                    }
                                }
                                ;
                            });

                        }, function() {
                            alert("TIENES QUE CONFIRMARNOS TU CORREO");
                            location.reload();
                        });
                    }else{

                        var userQvo = firebase.database().ref('/userQvo/').child(user.$id);
                        var userQvoRQ = $firebaseObject(userQvo);
                        userQvoRQ.$loaded().then(function () {
                            //console.log(userQvoRQ);
                            $scope.userQvoRQ = userQvoRQ;
                            if($scope.userQvoRQ.userQvoId != undefined){
                                // el usuario esta perfect.
                                //console.log("EL USUARIO ESTA PERFECT");
                            }else{

                                var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/createUserQvo?email="
                                    +user.email
                                    +"&name="
                                    +user.displayName

                                $http({
                                    method: 'GET',
                                    url: url,
                                    crossOrigin: true,
                                }).then(function successCallback(response) {
                                    //console.log(response);
                                    if(response.data.error != undefined){
                                        alert("ESTE CORREO YA EXISTE");

                                    }
                                    else{
                                        firebase.database().ref('userQvo/' + user.$id).set(
                                            {
                                                id :user.$id,
                                                userQvoEmail : response.data.email,
                                                userQvoId : response.data.id,
                                                userQvoName: response.data.name
                                            }
                                        );
                                    };

                                    // this callback will be called asynchronously
                                    // when the response is available
                                }, function errorCallback(response) {
                                    // called asynchronously if an error occurs
                                    // or server returns response with an error status.
                                });


                            }
                        });



                    }

                };
            };

            function dialogControllerAdquirirServicio($scope, $mdDialog, $timeout, $q, $log, $http, eventsService,userQvoRQ ) {
                $scope.eventsService = eventsService;
                //console.log(eventsService);
                $scope.usuarioLogeado = usuarioLogeado;
                $scope.userQvoRQ =userQvoRQ;
                //console.log($scope.usuarioLogeado);
                $scope.maxEntradas = [];
                $scope.newTicket = [];
                $scope.cantidadDeCompra = 1;
                $scope.celular;



                if ($scope.usuarioLogeado.celular) {
                    $scope.celular = $scope.usuarioLogeado.celular;
                };
                if($scope.usuarioLogeado.email != 'null@izinait.com'){
                    $scope.email = $scope.usuarioLogeado.email;
                }else{
                    $scope.email = "";
                };



                for (var i = 1; i <= $scope.eventsService.maxEntradas; i++) {
                    var entradas = {
                        id: i,
                        name: i
                    };
                    $scope.maxEntradas.push(entradas);
                    ////console.log("Entradas", $scope.maxEntradas)
                };


                $scope.aumentarTicket = function () {
                    //console.log($scope.eventsService.maxEntradas);
                    if($scope.eventsService.maxEntradas > $scope.cantidadDeCompra){
                        $scope.cantidadDeCompra += 1;
                    }

                };

                $scope.disminuirTicket = function () {
                    if($scope.cantidadDeCompra > 1){
                        $scope.cantidadDeCompra -= 1
                    }
                   ;
                };

                $scope.adquirir = function (cantidadDeCompra, celular,metodoDePagoSelect) {
                    //console.log(celular.toString().length);
                    if(celular.toString().length > 7){
                        if(cantidadDeCompra >0 )
                        {
                            if (validateEmail($scope.email)) {
                                if(metodoDePagoSelect != undefined){
                                    if(metodoDePagoSelect == "oneClick"){

                                        document.getElementById('panelPrincipal').style.display = 'none';
                                        document.getElementById('panelDireccionando').style.display = 'block';

                                        // creditCardDefaulf if sino redireccionar a agregar tarjeta de credito

                                        var cobroTotal = $scope.eventsService.precio * cantidadDeCompra * 1.05 + 500;

                                        var url  = "https://us-central1-project-8746388695669481444.cloudfunctions.net/cobrarTarjetaDeCredito" +
                                            "?userQvo=" + $scope.userQvoRQ.userQvoId +
                                            "&" +
                                            "tarjetaCredito=" + $scope.userQvoRQ.creditCardDefault +
                                            "&" +
                                            "cobroTotal="+  cobroTotal;

                                        $http({
                                            method: 'GET',
                                            url: url,
                                            crossOrigin: true,
                                        }).then(function successCallback(response) {
                                            //console.log(response);
                                            if(response.data.status == "successful"){
                                                document.getElementById('panelDireccionando').style.display = 'none';
                                                document.getElementById('panelCompraExito').style.display = 'block';
                                                var pagoPuerta = false;


                                                //console.log(response.data.status);

                                                $scope.newTicket.email = $scope.usuarioLogeado.email;
                                                $scope.newTicket.ideventservices = $scope.eventsService.id;
                                                $scope.newTicket.tipoEventservices = $scope.eventsService.tipo;
                                                // !!!!!! falta rescatar el id de la fila selecionada "del servicio a comprar"
                                                $scope.newTicket.displayName = $scope.usuarioLogeado.displayName;
                                                $scope.newTicket.lastName = $scope.usuarioLogeado.lastName; //$scope.datosTicket.lastName;
                                                $scope.newTicket.firstName = $scope.usuarioLogeado.firstName; //$scope.datosTicket.firstName;
                                                $scope.newTicket.celular = celular;
                                                $scope.newTicket.date = new Date().getTime();
                                                $scope.newTicket.userFacebook = true;
                                                $scope.newTicket.tipoEntrada =  $scope.eventsService.tipo;
                                                $scope.newTicket.paidOut = true; //devolver pago
                                                $scope.newTicket.redeemed = false;
                                                $scope.newTicket.pagoPuerta = pagoPuerta;
                                                $scope.newTicket.cantidadUtilizada = 0;
                                                $scope.newTicket.rrppid = Rrpp;
                                                $scope.newTicket.cantidadDeCompra = cantidadDeCompra;
                                                $scope.newTicket.totalAPagar = $scope.eventsService.precio * cantidadDeCompra;
                                                $scope.newTicket.totalPagadoConComision = $scope.eventsService.precio * cantidadDeCompra * 1.05 + 500;
                                                $scope.newTicket.eventId = eventId;
                                                $scope.newTicket.userId = $scope.usuarioLogeado.$id;
                                                $scope.newTicket.ticketId = firebase.database().ref().child('ticketsCreate/').push().key;
                                                $scope.newTicket.idTransaccion = response.data.id;
                                                $scope.newTicket.fechaCaducacion = getEvent.toHour;
                                                //
                                                firebase.database().ref('tickets/' + eventId + '/'  + $scope.newTicket.ticketId).set($scope.newTicket).then(
                                                    function (s) {
                                                        //console.log('se guardaron bien el tickets');
                                                        firebase.database().ref('ticketsCreate/' + $scope.newTicket.ticketId).set(true);

                                                        //  firebase.database().ref('users/' + $scope.usuarioLogeado.$id + '/events/'+ $scope.event.admin+'/' + eventId).set(true);

                                                        firebase.database().ref('users/' + $scope.usuarioLogeado.$id).update(
                                                            {
                                                                celular: $scope.newTicket.celular,
                                                            });

                                                        firebase.database().ref('users/' + $scope.usuarioLogeado.$id + "/tickets/"+ $scope.newTicket.ticketId).update(
                                                            {
                                                                eventId: eventId,
                                                                ticketId :$scope.newTicket.ticketId
                                                            });


                                                        firebase.database().ref('userQvo/' + $scope.usuarioLogeado.$id +'/charges/'+ response.data.id)
                                                            .update(response.data);

                                                       // $mdDialog.hide();

                                                        /*      $scope.getClub = function (club) {
                                                         if (club) {
                                                         var clubKey = Object.keys(club)[0];
                                                         return $filter('filter')(clubsER, {$id: clubKey})[0].name;
                                                         }
                                                         };
                                                         var nameClub = $scope.getClub(getEvent.clubs);
                                                         */

                                                        /*   $.ajax({
                                                         url: 'http://www.abcs.cl/correo/reservarServicio.php',
                                                         type: "POST",
                                                         data: {
                                                         name: $scope.usuarioLogeado.displayName,
                                                         phone: $scope.newTicket.celular,
                                                         email:  $scope.usuarioLogeado.email,
                                                         message: "GRACIAS POR COMPRAR ESTE SERVICIO",
                                                         eventName : getEvent.name,
                                                         clubName : nameClub
                                                         },
                                                         cache: false,
                                                         success: function() {
                                                         //console.log("siiiiiiiiiiiiiiiiiiiiiii");
                                                         },
                                                         error: function() {
                                                         //console.log("noooooooooooooooooooooo");
                                                         },
                                                         }); */

                                                    }, function (e) {
                                                        alert('Error, intente de nuevo');
                                                        // //console.log('se guardo mal ', e);
                                                    }
                                                );
                                                //mostrar mensaje de exito!
                                            }
                                            else{
                                                document.getElementById('panelDireccionando').style.display = 'none';
                                                document.getElementById('panelCompraRechazada').style.display = 'block';
                                            };
                                            // this callback will be called asynchronously
                                            // when the response is available
                                        }, function errorCallback(response) {
                                            // called asynchronously if an error occurs
                                            // or server returns response with an error status.
                                        });


                                    };

                                    if(metodoDePagoSelect =="webPayPlus"){

                                        var pagoPuerta = false;

                                        $scope.newTicket.ticketId = firebase.database().ref().child('ticketsCreate/').push().key;
                                        firebase.database().ref('ticketsCreate/' + $scope.newTicket.ticketId).set(true);

                                        $scope.newTicket.email = $scope.usuarioLogeado.email;
                                        $scope.newTicket.ideventservices = $scope.eventsService.id;
                                        $scope.newTicket.tipoEventservices = $scope.eventsService.tipo;
                                        // !!!!!! falta rescatar el id de la fila selecionada "del servicio a comprar"
                                        $scope.newTicket.displayName = $scope.usuarioLogeado.displayName;
                                        $scope.newTicket.lastName = $scope.usuarioLogeado.lastName; //$scope.datosTicket.lastName;
                                        $scope.newTicket.firstName = $scope.usuarioLogeado.firstName; //$scope.datosTicket.firstName;
                                        $scope.newTicket.celular = celular;
                                        $scope.newTicket.userFacebook = true;
                                        $scope.newTicket.tipoEntrada =  $scope.eventsService.tipo;
                                        $scope.newTicket.date = new Date().getTime();
                                        $scope.newTicket.paidOut = false; //devolver pago
                                        $scope.newTicket.pagoPuerta = pagoPuerta;
                                        $scope.newTicket.redeemed = false;
                                        $scope.newTicket.cantidadUtilizada = 0;
                                        $scope.newTicket.rrppid = Rrpp;
                                        $scope.newTicket.cantidadDeCompra = cantidadDeCompra;
                                        $scope.newTicket.totalAPagar = $scope.eventsService.precio * cantidadDeCompra;
                                        $scope.newTicket.totalPagadoConComision = $scope.eventsService.precio * cantidadDeCompra * 1.05 + 500;
                                        $scope.newTicket.eventId = eventId;
                                        $scope.newTicket.userId = $scope.usuarioLogeado.$id;
                                        $scope.newTicket.fechaCaducacion = getEvent.toHour;
                                       // $scope.newTicket.idTransaccion = response.data.id;

                                        firebase.database().ref('tickets/' + eventId + '/'  + $scope.newTicket.ticketId).set($scope.newTicket).then(
                                            function (s) {
                                                //console.log('se guardaron bien el tickets');

                                                //  firebase.database().ref('users/' + $scope.usuarioLogeado.$id + '/events/'+ $scope.event.admin+'/' + eventId).set(true);

                                                firebase.database().ref('users/' + $scope.usuarioLogeado.$id).update(
                                                    {
                                                        celular: $scope.newTicket.celular,
                                                    });

                                                firebase.database().ref('users/' + $scope.usuarioLogeado.$id + "/tickets/"+ $scope.newTicket.ticketId).update(
                                                    {
                                                        eventId: eventId,
                                                        ticketId :$scope.newTicket.ticketId
                                                    });


                                                //firebase.database().ref('userQvo/' + $scope.usuarioLogeado.$id +'/charges/'+ response.data.id)
                                                  //  .update(response.data);


                                            }, function (e) {
                                                alert('Error, intente de nuevo');
                                                // //console.log('se guardo mal ', e);
                                            });

                                        document.getElementById('panelPrincipal').style.display = 'none';
                                        document.getElementById('panelRedirectWebPayPlus').style.display = 'block';
                                //console.log($scope.newTicket.totalPagadoConComision);

                                        var url ="https://us-central1-project-8746388695669481444.cloudfunctions.net/cobrarConWebPayPlus?" +
                                            "userQvo=" + $scope.userQvoRQ.userQvoId +
                                            "&" +
                                            "cobroTotal=" + $scope.newTicket.totalPagadoConComision +"&"+
                                            "userId="+$scope.userQvoRQ.id+"&ticketId="+$scope.newTicket.ticketId+"&eventId="+eventId;

                                        $http({
                                            method: 'GET',
                                            url: url,
                                            crossOrigin: true,
                                        }).then(function successCallback(response) {
                                            //console.log(response);
                                            location.href = response.data.redirect_url;
                                            // this callback will be called asynchronously
                                            // when the response is available
                                        }, function errorCallback(response) {
                                            // called asynchronously if an error occurs
                                            // or server returns response with an error status.
                                        });

                                    }
                                }else{
                                    alert('SELECIONE METODO DE PAGO');
                                }
                            }else{
                                alert('INGRESE UN CORREO ELECTRONICO VALIDO');
                            }





                        }else{
                            alert('INGRESA CANTIDAD DE COMPRA DISTINCA A 0 ');
                        }
                    }else{
                        alert('INGRESA UN NUMERO CELULAR VALIDO');
                    };



                };


                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };

                function validateEmail(email) {
                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                }

                $scope.crearCliente = function () {

                    var userQvoRQ =  $scope.userQvoRQ;
                    var usuarioLogeado =  $scope.usuarioLogeado;


                    $mdDialog.show({
                        controller: controllerDialogCrearClienteQvo,
                        templateUrl: 'dialogCrearClienteQvo',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true,
                        locals: {
                            usuarioLogeado: usuarioLogeado,
                            userQvoRQ:userQvoRQ
                        }
                    });

                };

                function controllerDialogCrearClienteQvo($scope, $mdDialog, $timeout, $q, $log,$http, usuarioLogeado,userQvoRQ) {

                    $scope.usuarioLogeado = usuarioLogeado;
                    $scope.userQvoRQ = userQvoRQ;



                    if($scope.userQvoRQ.userQvoId != undefined){

                        var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/agregarTarjetaUsuarioQvo?userQvo="
                            +$scope.userQvoRQ.userQvoId;
                        $http({
                            method: 'GET',
                            url: url,
                            crossOrigin: true,
                        }).then(function successCallback(response) {
                            //console.log(response);
                            location.href = response.data.redirect_url ;
                            // this callback will be called asynchronously
                            // when the response is available
                        }, function errorCallback(response) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        });
                    }else {

                        document.getElementById('BarraCargando').style.display = 'block';
                        document.getElementById('datosClienteQvo').style.display = 'none';
                        document.getElementById('barraRedirectUrl').style.display = 'none';

                        var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/createUserQvo?email="
                            +$scope.usuarioLogeado.email
                            +"&name="
                            +$scope.usuarioLogeado.displayName;

                        $http({
                            method: 'GET',
                            url: url,
                            crossOrigin: true,
                        }).then(function successCallback(response) {
                            //console.log(response);
                            if(response.data.error != undefined){
                                alert("ESTE CORREO YA EXISTE");
                            }
                            else{
                                firebase.database().ref('userQvo/' + $scope.usuarioLogeado.$id).set(
                                    {
                                        id :$scope.usuarioLogeado.$id,
                                        userQvoEmail : response.data.email,
                                        userQvoId : response.data.id,
                                        userQvoName: response.data.name
                                    }
                                );
                                location.reload();
                            };

                            // this callback will be called asynchronously
                            // when the response is available
                        }, function errorCallback(response) {
                            // called asynchronously if an error occurs
                            // or server returns response with an error status.
                        });


                    }


                    /*                    firebase.database().ref('userQvo/' + $scope.usuarioLogeado.$id ).update(
                     {
                     email: $scope.usuarioLogeado.email,
                     uid :$scope.usuarioLogeado.$id,
                     qvo :true
                     }
                     ); */






                    $scope.hide = function () {
                        $mdDialog.hide();
                    };

                    $scope.cancel = function () {
                        $mdDialog.cancel();

                    };


                };




            };


            $scope.confirmarCorreo = function (user) {

                if(user.email == "null@izinait.com"){
                    // Appending dialog to document.body to cover sidenav in docs app
                    var confirm = $mdDialog.prompt()
                        .title('Confirmanos tu correo')
                        .textContent('Recuerda colocar un correo valido')
                        .placeholder('Correo Electronico')
                        .ariaLabel('Correo Electronico')
                        .initialValue('')
                        .ok('Confirmar!')
                        .cancel('');
                    $mdDialog.show(confirm).then(function(result) {
                            //validar que este correo no exista en la bd
                        firebase.database().ref('users/' + user.$id).update({
                            email: result
                        });
                        location.reload();

                    }, function() {
                        alert("TIENES QUE CONFIRMARNOS TU CORREO");
                        location.reload();
                    });
                }else{

                    var userQvo = firebase.database().ref('/userQvo/').child(user.$id);
                    var userQvoRQ = $firebaseObject(userQvo);
                    userQvoRQ.$loaded().then(function () {
                        //console.log(userQvoRQ);
                        $scope.userQvoRQ = userQvoRQ;
                        if($scope.userQvoRQ.userQvoId != undefined){
                            // el usuario esta perfect.
                            //console.log("EL USUARIO ESTA PERFECT");
                        }else{

                            var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/createUserQvo?email="
                                +user.email
                                +"&name="
                                +user.displayName

                            $http({
                                method: 'GET',
                                url: url,
                                crossOrigin: true,
                            }).then(function successCallback(response) {
                                //console.log(response);
                                if(response.data.error != undefined){
                                    alert("ESTE CORREO YA EXISTE");

                                }
                                else{
                                    firebase.database().ref('userQvo/' + user.$id).set(
                                        {
                                            id :user.$id,
                                            userQvoEmail : response.data.email,
                                            userQvoId : response.data.id,
                                            userQvoName: response.data.name
                                        }
                                    );
                                };

                                // this callback will be called asynchronously
                                // when the response is available
                            }, function errorCallback(response) {
                                // called asynchronously if an error occurs
                                // or server returns response with an error status.
                            });


                        }
                    });



                }

            };


//////////////////////////////////////////////


        }]);



