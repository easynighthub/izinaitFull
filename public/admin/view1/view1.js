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
                            $scope.Allvents = eventsAdminRequest;
                            document.getElementById('BarraCargando').style.display = 'none';

                        });
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                };

            });











        }]);

