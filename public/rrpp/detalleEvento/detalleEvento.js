/**
 * Created by andro on 20-10-2017.
 */




'use strict';

angular.module('myApp.detalleEvento', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/detalleEvento', {
                templateUrl: 'detalleEvento/detalleEvento.html',
                controller: 'detalleEventoCtrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }


        );
    }])



    .controller('detalleEventoCtrl', ['$scope','$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams,$firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {



            var rrpp = window.currentRRPP;
            var rrppLogeado = "";
            $scope.corteciasUtilizadas = {};
            $scope.corteciasUtilizadas.general = 0;
            $scope.corteciasUtilizadas.vipMesa = 0;
            $scope.corteciasUtilizadas.vip = 0;
            $scope.ticketsEvent = [];
            $scope.listaGratis = [];
            $scope.CortesiasEvent =[];

            var ticketsRequest = $firebaseArray(firebase.database().ref('/tickets/' + $routeParams.id));
            var eventsRequest = $firebaseObject(firebase.database().ref('/events/' + $routeParams.id));

            console.log(ticketsRequest);
            console.log(eventsRequest);


            $(sideEventos).addClass("active");
            $(sideRrpp).removeClass("active");

            firebase.database().ref('rrpps/').child(rrpp.$id || rrpp.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                //console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/rrpps/').child(rrpp.$id || rrpp.uid);
                    var rrppLocal = $firebaseObject(ref);
                    rrppLocal.$loaded().then(function () {
                        rrppLogeado = rrppLocal;
                        $('.photo').prepend($('<img>', {id: 'theImg', src: rrppLogeado.picture}));
                        $('.clubSelecionado').text(  rrppLogeado.name+ " ");
                        //console.log(rrppLogeado);
                        console.log(firebase.auth().currentUser);
                        if(rrppLogeado.confirm == false){
                            cambiarNickName(rrppLogeado);
                        };


                        var impresionesRequest = $firebaseObject(firebase.database().ref('/impresiones/' + $routeParams.id+'/'+rrppLogeado.$id));
                        impresionesRequest.$loaded().then(function(){
                            $scope.totalImpresiones = impresionesRequest.openLink;
                        });

                                eventsRequest.$loaded().then(function(){
                                  $scope.event =eventsRequest;
                                  console.log($scope.event);

                                    $scope.totalList = 0;
                                    $scope.totalTickets = 0;

                                    $scope.linkRRPP = "https://www.izinait.com/detalleEvento?id="+ $scope.event.id+"&friend="+rrppLogeado.$id;

                                    angular.forEach($scope.event.asist , function (j) {
                                        if(j.idRRPP == rrppLogeado.$id){
                                                $scope.totalList += j.totalList;

                                                $scope.listaGratis.push(j);
                                        }
                                    });


                                    ticketsRequest.$loaded().then(function(){

                                       angular.forEach(ticketsRequest , function (x) {
                                           if(x.rrppid == rrppLogeado.$id){
                                               if(x.tipoEntrada == 'vipMesa'){
                                                   $scope.corteciasUtilizadas.vipMesa += x.cantidadDeCompra;
                                               }
                                               if(x.tipoEntrada == 'general'){
                                                   $scope.corteciasUtilizadas.general += x.cantidadDeCompra;
                                               }
                                               if(x.tipoEntrada == 'vip'){
                                                   $scope.corteciasUtilizadas.vip += x.cantidadDeCompra;
                                               }

                                               if(x.tipoEventservices != 'cortesia'){
                                                   $scope.totalTickets += 1;
                                                   $scope.ticketsEvent.push(x);

                                               }else {
                                                   $scope.CortesiasEvent.push(x);
                                               }

                                           }



                                       });

                                    });







                                    var idClub = Object.keys(eventsRequest.clubs)[0];

                                    var corteciasHabilitadas = $firebaseObject(firebase.database().ref('/admins/' + eventsRequest.admin +'/rrpps/'+rrppLogeado.$id+'/cortecias/'+idClub));
                                    corteciasHabilitadas.$loaded().then(function(){
                                        console.log(corteciasHabilitadas);
                                        $scope.corteciasHabilitadas = corteciasHabilitadas;

                                        if($scope.corteciasHabilitadas.$value != null){

                                           $scope.corteciasHabilitadas.vip;
                                            $scope.corteciasHabilitadas.general;
                                           $scope.corteciasHabilitadas.vipMesa;

                                        }


                                    });
                                });




                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/rrpp.html";
                };

            });




            $scope.mandarCortecia =function () {




                $mdDialog.show({
                    controller: dialogControllerMandarCortecia,
                    templateUrl: 'dialogMandarCortecia',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    locals: {
                        event: $scope.event,
                        corteciasHabilitadas : $scope.corteciasHabilitadas,
                        corteciasUtilizadas: $scope.corteciasUtilizadas
                    }
                });

            };

            function dialogControllerMandarCortecia($scope, $mdDialog, $timeout, $q, $log,event,corteciasHabilitadas,corteciasUtilizadas) {

                $scope.event = event;
                console.log($scope.event);

                $scope.corteciasHabilitadas = corteciasHabilitadas;
                $scope.corteciasUtilizadas = corteciasUtilizadas;

                console.log(corteciasHabilitadas);
                console.log(corteciasUtilizadas);


                $scope.tipoCortecias = [];
                $scope.cantidad = 1;

                var users = $firebaseArray(firebase.database().ref().child('users'));
                users.$loaded().then(function () {

                });

                var usersManual = $firebaseArray(firebase.database().ref().child('usersManual'));
                usersManual.$loaded().then(function () {

                });

                angular.forEach($scope.corteciasHabilitadas ,function (x,key) {

                    $scope.tipoCortecias.push({
                        cantidad : x,
                        tipo :key
                    })
                });

                $scope.limite = 0;

                $scope.masEntradas = function () {
                        if(  $scope.cantidad < $scope.limite){
                            $scope.cantidad += 1;
                        }
                };



                $scope.menosEntradas = function () {
                    if( $scope.cantidad  > 1  ){
                        $scope.cantidad -= 1;
                    }

                };




                $scope.cantidadDeEntradas =function (tipo) {
                    console.log(tipo);
                    $scope.tipo = tipo.trim();


            if($scope.tipo == 'general'){
                $scope.limite  =  $scope.corteciasHabilitadas.general - $scope.corteciasUtilizadas.general;
                console.log($scope.limite);
            };

            if($scope.tipo == 'vip'){
                        $scope.limite  =  $scope.corteciasHabilitadas.vip - $scope.corteciasUtilizadas.vip;
                        console.log($scope.limite);
                    };

            if($scope.tipo == 'vipMesa'){
                        $scope.limite  =  $scope.corteciasHabilitadas.vipMesa - $scope.corteciasUtilizadas.vipMesa;
                        console.log($scope.limite);
                    };

            if($scope.limite == 0){
                $scope.cantidad = 0;
            }else {
                $scope.cantidad = 1;
            };
                };


                $scope.enviarCortecias = function () {
                    var nuevoTicket = firebase.database().ref().child('ticketsCreate/').push().key;

                    $scope.nuevoTickets = {};
                    $scope.nuevoTickets.cantidadDeCompra = $scope.cantidad;
                    $scope.nuevoTickets.cantidadUtilizada = 0;
                    $scope.nuevoTickets.celular = $scope.celular || '999999999';
                    $scope.nuevoTickets.date =  Date.now();
                    $scope.nuevoTickets.displayName = $scope.nombreCompleto;
                    $scope.nuevoTickets.email = $scope.email;
                    $scope.nuevoTickets.eventId = $scope.event.$id;
                    $scope.nuevoTickets.firstName = $scope.nombreCompleto;
                    $scope.nuevoTickets.idTransaccion = 'none';
                    $scope.nuevoTickets.ideventservices = 'cortesia';
                    $scope.nuevoTickets.lastName = 'none';
                    $scope.nuevoTickets.pagoPuerta = false;
                    $scope.nuevoTickets.paidOut = true;
                    $scope.nuevoTickets.redeemed = false;
                    $scope.nuevoTickets.rrppid =rrppLogeado.$id;
                    $scope.nuevoTickets.ticketId = nuevoTicket;
                    $scope.nuevoTickets.tipoEventservices = 'cortesia';
                    $scope.nuevoTickets.totalAPagar = 0;
                    $scope.nuevoTickets.totalPagadoConComision = 0;
                    $scope.nuevoTickets.tipoEntrada = $scope.tipoSelecionado.trim();

                    if($scope.nuevoTickets.tipoEntrada == "general"){
                        $scope.nuevoTickets.fechaCaducacion = $scope.event.hourCorteciaGeneral;
                    };
                    if($scope.nuevoTickets.tipoEntrada == "vip"){
                        $scope.nuevoTickets.fechaCaducacion = $scope.event.hourCorteciaVip;
                    };
                    if($scope.nuevoTickets.tipoEntrada == "vipMesa"){
                        $scope.nuevoTickets.fechaCaducacion = $scope.event.hourCorteciaVipMesa;
                    };





                  /*  $scope.nuevaAsistencia = {};
                    $scope.nuevaAsistencia.asistencia = false;
                    $scope.nuevaAsistencia.fechaClick = Date.now();
                    $scope.nuevaAsistencia.totalList = $scope.cantidad;
                    $scope.nuevaAsistencia.totalAsist = 0;
                    $scope.nuevaAsistencia.displayName = $scope.nombreCompleto;
                    $scope.nuevaAsistencia.idRRPP = rrppLogeado.$id;
                    $scope.nuevaAsistencia.tipo = $scope.tipoSelecionado.trim();

                    if($scope.nuevaAsistencia.tipo == "general"){
                        $scope.nuevaAsistencia.fechaCaducacion = $scope.event.hourCorteciaGeneral;
                    };
                    if($scope.nuevaAsistencia.tipo == "vip"){
                        $scope.nuevaAsistencia.fechaCaducacion = $scope.event.hourCorteciaVip;
                    };
                    if($scope.nuevaAsistencia.tipo == "vipMesa"){
                        $scope.nuevaAsistencia.fechaCaducacion = $scope.event.hourCorteciaVipMesa;
                    };

                    $scope.nuevaAsistencia.email = $scope.email;
                    $scope.nuevaAsistencia.cortecia = true;*/


                       var contadorUsers = 0;
                       var contadorUsersManual = 0;
                        //console.log(users);
                        users.forEach(function (x) {
                            //noinspection JSAnnotator,JSAnnotator
                            if(x.email == $scope.email)
                            {
                                $scope.nuevoTickets.userId = x.$id;
                                //$scope.nuevaAsistencia.id = x.$id;
                                //$scope.nuevaAsistencia.userFacebook = true;
                                $scope.nuevoTickets.userFacebook = true;

                               // firebase.database().ref('events/' +  $scope.event.$id + '/asist/' + $scope.nuevaAsistencia.id).update($scope.nuevaAsistencia);
                                firebase.database().ref('tickets/' +  $scope.event.$id + '/'+ $scope.nuevoTickets.ticketId).update($scope.nuevoTickets);

                                firebase.database().ref('users/' +  $scope.nuevoTickets.userId + "/tickets/"+ $scope.nuevoTickets.ticketId).update(
                                    {
                                        eventId: $scope.event.$id,
                                        ticketId :$scope.nuevoTickets.ticketId
                                    });
                                $mdDialog.hide();
                                cargarTodo();


                                throw x;
                            } else
                                {
                                    contadorUsers += 1;
                                };
                        });
                        if(contadorUsers == users.length){
                            usersManual.forEach(function (j) {
                                if(j.email == $scope.email){
                                    $scope.nuevoTickets.userId = j.$id;
                                    //$scope.nuevaAsistencia.id =j.$id;
                                   // $scope.nuevaAsistencia.userFacebook = false;
                                    $scope.nuevoTickets.userFacebook = false;
                                    console.log( $scope.nuevoTickets);
                                   // firebase.database().ref('events/' +  $scope.event.$id + '/asist/' + $scope.nuevaAsistencia.id).update($scope.nuevaAsistencia);
                                    firebase.database().ref('tickets/' +  $scope.event.$id + '/'+ $scope.nuevoTickets.ticketId).update($scope.nuevoTickets);


                                    firebase.database().ref('usersManual/' +  $scope.nuevoTickets.userId + "/tickets/"+ $scope.nuevoTickets.ticketId).update(
                                        {
                                            eventId: $scope.event.$id,
                                            ticketId :$scope.nuevoTickets.ticketId
                                        });
                                    $mdDialog.hide();
                                    throw j;
                                }else{
                                    contadorUsersManual +=1;
                                }
                            });
                        };

                        if(contadorUsersManual == usersManual.length){
                            var nuevoUsuario = firebase.database().ref().child('usersManual/').push().key;

                            firebase.database().ref('usersManual/' + nuevoUsuario ).update({
                                celular: $scope.celular,
                                email: $scope.email,
                                nombreCompleto: $scope.nombreCompleto}).then(
                                    function (s) {
                                        $scope.nuevoTickets.userId = nuevoUsuario;
                                        //$scope.nuevaAsistencia.id = nuevoUsuario;
                                        //$scope.nuevaAsistencia.userFacebook = false;
                                        $scope.nuevoTickets.userFacebook = false;
                                        console.log( $scope.nuevoTickets);
                                       // firebase.database().ref('events/' +  $scope.event.$id + '/asist/' + nuevoUsuario).update($scope.nuevaAsistencia);
                                        firebase.database().ref('tickets/' +  $scope.event.$id + '/'+ $scope.nuevoTickets.ticketId).update($scope.nuevoTickets);

                                        firebase.database().ref('usersManual/' +  $scope.nuevoTickets.userId + "/tickets/"+ $scope.nuevoTickets.ticketId).update(
                                            {
                                                eventId: $scope.event.$id,
                                                ticketId :$scope.nuevoTickets.ticketId
                                            });
                                        $mdDialog.hide();
                                    });



                        };




                };



                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };











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

            function dialogControllerCambiarNickName($scope, $mdDialog, $timeout, $q, $log,rrppLogeadoRecibido) {
                //console.log(rrppLogeadoRecibido);

                if(rrppLogeadoRecibido.uid == rrppLogeadoRecibido.nickName){
                    $scope.nickName = "";
                };
                if(rrppLogeadoRecibido.email == 'null@izinait.com'){
                    $scope.email = "";
                }else{
                    $scope.email = rrppLogeadoRecibido.email;
                }

                $scope.confirmarDatos = function () {

                    var nickNameYaExiste = false ;
                    var cantidad = 0;
                    $scope.nickName = $scope.nickName.toLowerCase();


                    var buscarNickname = firebase.database().ref('/nickName');
                    var buscarmeRequest = $firebaseArray(buscarNickname);
                    buscarmeRequest.$loaded().then(function () {
                        $scope.nickNameSelect = buscarmeRequest;
                        $scope.nickNameSelect.forEach(function (x) {

                            //console.log("entre si mi nick estiste dentro de los rrpps");
                            if(x.nickName == $scope.nickName){
                                nickNameYaExiste = true ;
                            }

                            //console.log(nickNameYaExiste);
                            cantidad++;
                            //console.log(cantidad);

                            if(cantidad == $scope.nickNameSelect.length){
                                //console.log("entra esta wea")
                                $scope.function2();
                            };

                        });
                    });

                    $scope.function2 = function (){
                        if(nickNameYaExiste != true){
                            firebase.database().ref('rrpps/' + rrppLogeadoRecibido.$id).update(
                                {
                                    nickName: $scope.nickName,
                                    confirm : true,
                                    email :$scope.email
                                });
                            firebase.database().ref('nickName/' + rrppLogeadoRecibido.$id).update(
                                {nickName:$scope.nickName,
                                    uid :rrppLogeadoRecibido.$id
                                });
                            $mdDialog.hide();
                        }else{
                            alert("El NICKNAME utilizado ya existe en otro rrpp, elije, escribe algo distinto");
                        };

                    };



                };


                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };




            $scope.shareWhatsappRRPPEvento = function () {
                var longUrl = $scope.linkRRPP;
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




            $scope.shareButtonFacebookRRPP = function () {
                var longUrl = $scope.linkRRPP;
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











        }]);