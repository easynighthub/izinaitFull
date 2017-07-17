'use strict';

angular.module('myApp.view1', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
                templateUrl: 'view1/view1.html',
                controller: 'View1Ctrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }


        );
    }])



    .controller('View1Ctrl', ['$scope', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope, $firebaseObject, $firebaseArray, $filter, $rootScope) {



            var admin = window.currentAdmin ;
            var adminLogeado = "";
            $scope.eventosFuturoFecha = new Date().getTime();
            $scope.eventsWithServices = [];


            $(eventos).addClass( "active" );
            $(configuracion).removeClass( "active" );

            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        console.log(adminLogeado)
                        var eventosAdmin = firebase.database().ref('/events').orderByChild('admin').equalTo(adminLogeado.$id);
                        var eventsAdminRequest = $firebaseArray(eventosAdmin);
                        eventsAdminRequest.$loaded().then(function() {
                            $scope.Allvents = $filter('filter')(eventsAdminRequest, getFuturesEvents); ;
                            console.log($scope.allEvents);
                            $scope.Allvents.forEach(function (x) {
                                var eventServices = firebase.database().ref('/eventServices/'+x.$id);
                                var eventServicesRQ = $firebaseArray(eventServices);
                                eventServicesRQ.$loaded().then(function(){
                                    x.reservas = eventServicesRQ;
                                    x.ReservaCantidad = eventServicesRQ.length;
                                    $scope.eventsWithServices.push(x);
                                    console.log($scope.eventsWithServices);
                                });
                            });
                            document.getElementById('BarraCargando').style.display = 'none';
                            $('.tituloIziboss').text("Eventos Futuros");

                        });
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                };

            });


            var getFuturesEvents = function (value, index, array) {
                // var currentDay = new Date().getTime();
                var date = new Date().getTime();
                // if (currentDay < value.toHour){
                if ($scope.eventosFuturoFecha < value.toHour) {
                    return true;

                }
                //}
                else
                    return false;
            };








        }]);

