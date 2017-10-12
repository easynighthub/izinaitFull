/**
 * Created by andro on 04-08-2017.
 */



'use strict';
angular.module('myApp.listaGratis', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/listaGratis', {
            templateUrl: 'listaGratis/listaGratis.html',
            controller: 'viewlistaGratis'
        });
    }])
    .controller('viewlistaGratis', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope','$mdDialog',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope,$mdDialog) {

            var doorman = window.currentDoorman;
            var doormanLogeado = "";
            var eventIdSelect = localStorage.getItem('eventIdSelect');
            //console.log(eventIdSelect);
            var eventId = $routeParams.id || eventIdSelect; // id del evento entregador por url
            var eventoCompleto = [];
            firebase.database().ref('events/').child(eventId).once('value', function(snapshot) {
                eventoCompleto = snapshot.val() ;
            });
            $scope.code = '';
            if($routeParams.code){
                $scope.code = $routeParams.code;
            }

            $scope.url = 'zxing://scan/?ret=http://'+location.host+'/codigoRecibido.html?code={CODE}';




            firebase.database().ref('doormans/').child(doorman.$id || doorman.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                //console.log(exists);

                if (exists == true) {
                    var ref = firebase.database().ref('/doormans/').child(doorman.$id || doorman.uid);
                    var doormLocal = $firebaseObject(ref);
                    doormLocal.$loaded().then(function () {
                        doormanLogeado = doormLocal;
                        //console.log(doormanLogeado);

                        var listaGratis = $firebaseArray(firebase.database().ref('/events/'+ eventId+'/asist'));
                        listaGratis.$loaded().then(function () {
                            $scope.AllListaGratis = listaGratis;
                            //console.log($scope.AllListaGratis);
                            $scope.listaGratis = $scope.AllListaGratis;

                            if($scope.code != ""){
                                $scope.listaGratis = $filter('filter')($scope.AllListaGratis, {$id: $scope.code});
                                //console.log($scope.code);
                            };
                        });




                    });
                } else {
                    window.currentDoorman = "";
                    doormanLogeado = "";
                    //console.log(window.currentDoorman + " NO ENTRE");
                };

            });


            $scope.abrirLectorQr = function () {
                location.href = $scope.url;
            };

            $scope.filterEventsByText = function () {
                ////console.log("adsadasdsa");
                $scope.listaGratis = $filter('filter')($scope.AllListaGratis, {displayName: $scope.filterNameInput});
            }





            $scope.abrirListaGratis = function (userCapturado) {
                var user = [];
                //console.log(userCapturado);
                firebase.database().ref('users/').child(userCapturado.$id).once('value', function(snapshot) {
                    var exists = (snapshot.val() !== null);
                   if(exists){
                        user = snapshot.val();
                    };

                        $mdDialog.show({
                            controller: ControllerdialogAbrirListaGratis,
                            templateUrl: 'dialogAbrirListaGratis',
                            parent: angular.element(document.body),
                            clickOutsideToClose:true,
                            locals : {
                                userCapturado : userCapturado,
                                user : user
                            }
                        });



                });


            };

            function ControllerdialogAbrirListaGratis($scope, $mdDialog,$timeout, $q, $log, userCapturado,user) {
                //console.log(userCapturado);
                $scope.doormanLogeado = doormanLogeado;
                //console.log(user);
                $scope.user = user;
                $scope.userCapturado = userCapturado;
                //console.log($scope.userCapturado);
                $scope.entradasHombre = 0;
                $scope.entradasMujer = 0;

                $scope.disminuirEntradasHombre = function (entradasHombre) {
                    if(entradasHombre == 0){
                        //console.log("no se puede disminiur mas");
                    }else {
                        //console.log("funciona")
                        $scope.entradasHombre -= 1;
                    }
                };
                $scope.disminuirEntradasMujer = function (entradasMujer) {
                    if(entradasMujer == 0){
                        //console.log("no se puede disminiur mas");
                    }else {
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
                    var nuevoIngreso = firebase.database().ref('events/' + eventId  +'/asist'+$scope.userCapturado.$id +'/ingresos').push().key;


                        firebase.database().ref('events/' + eventId  +'/asist/'+$scope.userCapturado.$id).update({
                            totalAsist : total
                        });

                        firebase.database().ref('events/' + eventId  +'/asist/'+$scope.userCapturado.$id +'/ingresos/'+nuevoIngreso).update({
                            cantidadHombres : $scope.entradasHombre,
                            cantidadMujer : $scope.entradasMujer,
                            fechaIngreso : new Date().getTime(),
                            gratis : true,

                        });

                    var idClub = Object.keys(eventoCompleto.clubs)[0];
                    var GuardarCliente='admins/'+eventoCompleto.admin+'/clients/'+idClub+'/'+$scope.userCapturado.userId;
                    firebase.database().ref(GuardarCliente).set(true);

                    firebase.database().ref('users/' + $scope.userCapturado.userId + '/events/' +eventoCompleto.admin+'/'+idClub+'/'+ eventId).set(new Date().getTime());


                    $mdDialog.hide();



                };


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
