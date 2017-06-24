/**
 * Created by andro on 23-06-2017.
 */
'use strict';
angular.module('myApp.userDetalle', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/userDetalle', {
            templateUrl: 'userDetalle/userDetalle.html',
            controller: 'viewuserDetalle'
        });
    }])
    .controller('viewuserDetalle', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope) {


            var eventId = $routeParams.idEvent; // id del evento entregador por url
            var userId = $routeParams.idUser; // id del rrpp o amigo que compartio el evento
            $scope.hola = "event id "+ eventId+" userId " +userId;

        }]);
