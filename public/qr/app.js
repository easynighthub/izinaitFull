/**
 * Created by andro on 22-06-2017.
 */

'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'firebase',
    'ngRoute',
    'ngMap',
    'ngMaterial',
    'myApp.view1',
    'myApp.event',
    'myApp.userDetalle',
    'myApp.puerta',
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');



    var validateUser = function() {
        var data;
        for ( var i = 0, len = localStorage.length; i < len; ++i ) {
            var str = localStorage.key(i);
            var patt = new RegExp('firebase:authUser:');
            if(patt.test(str)){
                window.currentDoorman = JSON.parse(localStorage.getItem(str));
                console.log(window.currentDoorman);
                return true;
            }
        }
        return false;
    }

    if(validateUser()) {
        $routeProvider.otherwise({redirectTo: '/view1'});
        console.log(window.currentDoorman);
    } else {
        $routeProvider.otherwise({redirectTo: '/view1'});
        window.currentDoorman ="";
        console.log(window.currentDoorman);
    }


}]);