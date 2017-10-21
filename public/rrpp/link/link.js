/**
 * Created by andro on 24-08-2017.
 */


'use strict';

angular.module('myApp.link', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/link', {
                templateUrl: 'link/link.html',
                controller: 'linkCtrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }
        );
    }])


    .controller('linkCtrl', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope', '$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $mdDialog) {


            var rrpp = window.currentRRPP;
            var rrppLogeado = "";
            $scope.eventosFuturoFecha = new Date().getTime();
            $scope.eventsWithServices = [];
            $scope.events = [];


            $(sideEventos).removeClass("active");
            $(sideRrpp).addClass("active");

            firebase.database().ref('rrpps/').child(rrpp.$id || rrpp.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);
                //console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/rrpps/').child(rrpp.$id || rrpp.uid);
                    var rrppLocal = $firebaseObject(ref);
                    rrppLocal.$loaded().then(function () {
                        rrppLogeado = rrppLocal;
                        $('.photo').prepend($('<img>', {id: 'theImg', src: rrppLogeado.picture}));
                        $('.clubSelecionado').text(rrppLogeado.name + " ");
                        console.log('rrpp');
                        console.log(rrppLogeado);
                        //console.log(firebase.auth().currentUser);
                        if (rrppLogeado.confirm == false) {
                            cambiarNickName(rrppLogeado);
                        }
                        ;
                        if (rrppLogeado.events != undefined) {
                            angular.forEach(Object.keys(rrppLogeado.events), function (event) {
                                var eventsRequest = $firebaseObject(firebase.database().ref('/events/' + event));
                                eventsRequest.$loaded().then(function () {
                                    getFuturesEvents(eventsRequest);
                                });
                            });
                        }
                        ;


                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/rrpp.html";
                }
                ;

            });


            var cambiarNickName = function (rrppLogeadoRecibido) {
                //console.log(rrppLogeadoRecibido);


                var rrppLogeadoRecibido = rrppLogeadoRecibido;
                $mdDialog.show({
                    controller: dialogControllerCambiarNickName,
                    templateUrl: 'dialogCambiarNickName',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        rrppLogeadoRecibido: rrppLogeadoRecibido
                    }
                });

            };

            function dialogControllerCambiarNickName($scope, $mdDialog, $timeout, $q, $log, rrppLogeadoRecibido) {
                //console.log(rrppLogeadoRecibido);

                if (rrppLogeadoRecibido.uid == rrppLogeadoRecibido.nickName) {
                    $scope.nickName = "";
                }
                ;
                if (rrppLogeadoRecibido.email == 'null@izinait.com') {
                    $scope.email = "";
                } else {
                    $scope.email = rrppLogeadoRecibido.email;
                }

                $scope.confirmarDatos = function () {

                    var nickNameYaExiste = false;
                    var cantidad = 0;
                    $scope.nickName = $scope.nickName.toLowerCase();


                    var buscarNickname = firebase.database().ref('/nickName');
                    var buscarmeRequest = $firebaseArray(buscarNickname);
                    buscarmeRequest.$loaded().then(function () {
                        $scope.nickNameSelect = buscarmeRequest;
                        $scope.nickNameSelect.forEach(function (x) {

                            //console.log("entre si mi nick estiste dentro de los rrpps");
                            if (x.nickName == $scope.nickName) {
                                nickNameYaExiste = true;
                            }

                            //console.log(nickNameYaExiste);
                            cantidad++;
                            //console.log(cantidad);

                            if (cantidad == $scope.nickNameSelect.length) {
                                //console.log("entra esta wea")
                                $scope.function2();
                            }
                            ;

                        });
                    });

                    $scope.function2 = function () {
                        if (nickNameYaExiste != true) {
                            firebase.database().ref('rrpps/' + rrppLogeadoRecibido.$id).update(
                                {
                                    nickName: $scope.nickName,
                                    confirm: true,
                                    email: $scope.email
                                });
                            firebase.database().ref('nickName/' + rrppLogeadoRecibido.$id).update(
                                {
                                    nickName: $scope.nickName,
                                    uid: rrppLogeadoRecibido.$id
                                });
                            $mdDialog.hide();
                        } else {
                            alert("El NICKNAME utilizado ya existe en otro rrpp, elije, escribe algo distinto");
                        }
                        ;

                    };


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
                window.open('https://izinait.com/app/#!/detalleEvento?id=' + evento.$id + "&friend=" + rrppLogeado.$id, '_blank')
            };




            var getFuturesEvents = function (event) {
                event.listTotalRRPP = 0;
                event.ticketTotalRRPP = 0;
                var currentDay = new Date().getTime();
                var visible = true;
                //if (currentDay < event.toHour){
                console.log(event);

                angular.forEach(event.asist, function (x) {

                    if (x.idRRPP == rrppLogeado.$id) {
                        event.listTotalRRPP += x.totalList;
                        console.log(event.listTotalRRPP);
                    }
                    var ticketEvent = firebase.database().ref().child('tickets/' + event.id);
                    var ticketEventArray = $firebaseArray(ticketEvent);
                    ticketEventArray.$loaded().then(function () {
                        ticketEventArray.forEach(function (j) {
                            console.log(ticketEventArray);
                            if (j.rrppid == rrppLogeado.$id) {
                                event.ticketTotalRRPP += 1;
                                console.log(event.ticketTotalRRPP);
                            }
                        })

                    });

                });
                event.linkRRPP = "https://www.izinait.com/detalleEvento?id=" + event.id + "&friend=" + rrppLogeado.$id;
                $scope.events.push(event);
                return true;

                //  }
                //else
                //  return false;
            };


            $scope.shareWhatsappRRPP = function () {
                var longUrl = 'izinait.com/detalleEvento?id=' + eventId + '&friend=' + Rrpp;
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


        }]);
