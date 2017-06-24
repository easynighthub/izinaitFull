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



            var eventId = $routeParams.id; // id del evento entregador por url
            $scope.url = 'zxing://scan/?ret=http://'+location.host+'/reciveCode.html?code={CODE}';
            console.log(eventId);

            if (doorman != "") {
                var currentDay = new Date().getTime();
                var ref = firebase.database().ref('/doormans/').child(doorman.$id || doorman.uid);
                var doormanFB = $firebaseObject(ref);
                doormanFB.$loaded().then(function () {
                    doormanLogeado = doormanFB;
                    console.log(doormanLogeado);
                    console.log(window.currentDoorman + " ENTRE");
                });
            } else {
                console.log(window.currentDoorman + " NO ENTRE");
            }
            ;

        $scope.abrirLectorQr = function () {
            location.href = $scope.url;
        };


            var rrpps = $firebaseArray(firebase.database().ref('/rrpps/'));
            rrpps.$loaded().then(function () {
                rrppsCapturados = rrpps;
                console.log(rrppsCapturados);
                rrppsCapturados.forEach(function (x) {
                    console.log(x);
                    if(x.events != null){
                        $scope.eventsId = Object.keys(x.events);
                        $scope.eventsId.forEach(function (e) {
                            if(e == eventId){
                                $scope.rrpps.push(x);
                                console.log($scope.rrpps);
                            }
                        });
                    }

                });

            });







        }]);



