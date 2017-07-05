/**
 * Created by andro on 29-06-2017.
 */

'use strict';

angular.module('myApp.asist', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/asist', {
                templateUrl: 'asist/asist.html',
                controller: 'asistCtrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }


        );
    }])



    .controller('asistCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope, $firebaseObject, $firebaseArray, $filter, $rootScope) {



            var eventId = $routeParams.id; // id del evento entregador por url

            var doorman = window.currentDoorman;
            var doormanLogeado = "";
            $scope.allEvents = [];
            $scope.events = [];
            var eventIndex = 0;

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
            };


            var listaDeUsuariosGratis = firebase.database().ref('events/'+eventId+'/asist');
            var listaDeUsuariosGratisFB = $firebaseArray(listaDeUsuariosGratis);
            listaDeUsuariosGratisFB.$loaded().then(function(){

            });





        }]);