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
    .controller('viewevent', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {

            var doorman = window.currentDoorman;
            var doormanLogeado = "";
            var rrppsCapturados = [];
            $scope.rrpps = [];
            var eventIdSelect = localStorage.getItem('eventIdSelect');
            console.log(eventIdSelect);
            var eventId = $routeParams.id || eventIdSelect; // id del evento entregador por url
            var eventoCompleto = [];
            $scope.code = '';
            if($routeParams.code){
                $scope.code = $routeParams.code;
            }

            firebase.database().ref('events/').child(eventId).once('value', function(snapshot) {
              eventoCompleto = snapshot.val() ;
              console.log(Object.keys(eventoCompleto.clubs)[0]);
            });


            $scope.url = 'zxing://scan/?ret=http://'+location.host+'/codigoRecibido.html?code={CODE}';




            firebase.database().ref('doormans/').child(doorman.$id || doorman.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);

                if (exists == true) {
                    var ref = firebase.database().ref('/doormans/').child(doorman.$id || doorman.uid);
                    var doormLocal = $firebaseObject(ref);
                    doormLocal.$loaded().then(function () {
                        doormanLogeado = doormLocal;
                        console.log(doormanLogeado);

                        var tickets = $firebaseArray(firebase.database().ref('/tickets/'+ eventId));
                        tickets.$loaded().then(function () {
                            $scope.AllticketsObtenidos = tickets;
                            console.log($scope.AllticketsObtenidos);
                            $scope.ticketsObtenidos = $scope.AllticketsObtenidos;

                            if($scope.code != ""){
                                $scope.ticketsObtenidos = $filter('filter')($scope.AllticketsObtenidos, {userId: $scope.code});
                                console.log($scope.code);
                            };
                        });




                    });
                } else {
                    window.currentDoorman = "";
                    doormanLogeado = "";
                    console.log(window.currentDoorman + " NO ENTRE");
                };

            });


            $scope.abrirLectorQr = function () {
            location.href = $scope.url;
        };

            $scope.filterEventsByText = function () {
                console.log("adsadasdsa");
                $scope.ticketsObtenidos = $filter('filter')($scope.AllticketsObtenidos, {displayName: $scope.filterNameInput});
            }





            $scope.cobrarServicio = function (ticketObtenido) {
                        var user = [];
                    firebase.database().ref('users/').child(ticketObtenido.userId).once('value', function(snapshot) {
                        var exists = (snapshot.val() !== null);
                        if(exists){
                           user = snapshot.val();
                        };
                       if(ticketObtenido.cantidadUtilizada == ticketObtenido.cantidadDeCompra){
                           alert("TICKET FULL");
                       } else
                       {
                           $mdDialog.show({
                               controller: ControllerdialogCobrarServicio,
                               templateUrl: 'dialogCobrarServicio',
                               parent: angular.element(document.body),
                               clickOutsideToClose:true,
                               locals : {
                                   ticketObtenido : ticketObtenido,
                                   user : user
                               }
                           });
                       }


                    });


                };

                function ControllerdialogCobrarServicio($scope, $mdDialog,$timeout, $q, $log, ticketObtenido,user) {
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
                    var tipoDePago ;

                    $scope.disminuirEntradasHombre = function (entradasHombre) {
                        if(entradasHombre == 0){
                            console.log("no se puede disminiur mas");
                        }else {
                            console.log("funciona")
                            $scope.entradasHombre -= 1;
                        }
                    };
                    $scope.disminuirEntradasMujer = function (entradasMujer) {
                        if(entradasMujer == 0){
                            console.log("no se puede disminiur mas");
                        }else {
                            console.log("funciona")
                            $scope.entradasMujer -= 1;
                        }

                    };
                    $scope.aumentarEntradasHombre = function (entradasHombre,entradasMujer) {
                        if(entradasHombre + entradasMujer < $scope.ingresosRestantes){
                            console.log("funciona")
                            $scope.entradasHombre += 1;
                        }else{
                            console.log("no se puede aumentar mas ");
                        }

                    };
                    $scope.aumentarEntradasMujer = function (entradasHombre,entradasMujer) {
                        if(entradasHombre + entradasMujer < $scope.ingresosRestantes){
                                console.log("funciona")
                                $scope.entradasMujer += 1;

                        }else {
                            console.log("no se puede aumentar mas ");
                        }

                    };

                    $scope.guardarEntrada = function () {
                        var total = $scope.ticketObtenido.cantidadUtilizada + $scope.entradasHombre + $scope.entradasMujer;
                        var nuevoIngreso = firebase.database().ref('tickets/' + eventId  +'/'+$scope.ticketObtenido.$id +'/ingresos').push().key;

                        var idClub = Object.keys(eventoCompleto.clubs)[0];
                        var GuardarCliente='admins/'+eventoCompleto.admin+'/clients/'+idClub+'/'+ $scope.ticketObtenido.userId;
                        firebase.database().ref(GuardarCliente).set(true);
                        firebase.database().ref('users/' + $scope.ticketObtenido.userId + '/events/' +eventoCompleto.admin+'/'+idClub +'/'+ eventId).set(new Date().getTime());

                        if( $scope.ticketObtenido.paidOut)
                        {
                            firebase.database().ref('tickets/' + eventId  +'/'+$scope.ticketObtenido.$id).update({
                                    cantidadUtilizada : total,
                                    redeemed:true
                            });




                            firebase.database().ref('tickets/' + eventId  +'/'+$scope.ticketObtenido.$id +'/ingresos/'+nuevoIngreso).update({
                                cantidadHombres : $scope.entradasHombre,
                                cantidadMujer : $scope.entradasMujer,
                                fechaIngreso : new Date().getTime(),
                                pagoTotal : 0,
                                medioDePago : 'pagado'

                            });
                            $mdDialog.hide();
                        }else{

                            firebase.database().ref('tickets/' + eventId  +'/'+$scope.ticketObtenido.$id).update({
                                cantidadUtilizada : total,
                                redeemed:true
                            });
                            firebase.database().ref('tickets/' + eventId  +'/'+$scope.ticketObtenido.$id +'/ingresos/'+nuevoIngreso).update({
                                cantidadHombres : $scope.entradasHombre,
                                cantidadMujer : $scope.entradasMujer,
                                fechaIngreso : new Date().getTime(),
                                pagoTotal : ($scope.entradasHombre + $scope.entradasMujer)*$scope.precioIndividual,
                                medioDePago : tipoDePago

                            });

                            $mdDialog.hide();
                        }



                    };

                    $scope.obtenerTipoDePago = function (tipoPagoSelecionado) {
                        if(tipoDePago == tipoPagoSelecionado){
                            tipoDePago = "";
                            console.log(tipoDePago);
                        }else{
                            tipoDePago = tipoPagoSelecionado;
                            console.log(tipoDePago);
                        };
                    }

                    $scope.hide = function() {
                        $mdDialog.hide();
                    };

                    $scope.cancel = function() {
                        $mdDialog.cancel();

                    };


                };

           // var element = document.querySelector('meta[property="og:image"]');
           // var content = element && element.getAttribute("content");

            function ControllerdialogAbrirCode($scope, $mdDialog,$timeout, $q, $log, code) {
                $scope.code = code;

            };

            $scope.borrarQr = function () {
              $scope.code = '';
              location.href = "#!/event";
            };






        }]);



