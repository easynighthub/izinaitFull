'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngMeta',
    'firebase',
    'ngRoute',
    'ngMap',
    'ngMaterial',
    'myApp.view1',
    'myApp.view2',
    'myApp.detalleEvento',
    'myApp.detalleClub',
    'myApp.codigo',
    'myApp.rrpp',
    'myApp.version'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider, ngMetaProvider) {
    $locationProvider.hashPrefix('!');


    var validateUser = function () {
        var data;
        for (var i = 0, len = localStorage.length; i < len; ++i) {
            var str = localStorage.key(i);
            var patt = new RegExp('firebase:authUser:');
            if (patt.test(str)) {
                window.currentApp = JSON.parse(localStorage.getItem(str));
                console.log(window.currentApp);
                return true;
            }
        }
        return false;
    }

    if (validateUser()) {
        $routeProvider.otherwise({redirectTo: '/view1'});
        console.log(window.currentApp);
    } else {
        $routeProvider.otherwise({redirectTo: '/view1'});
        window.currentApp = "";
        console.log(window.currentApp);
    }

    function load() {
        gapi.client.setApiKey('AIzaSyDBVb3ISIrzhcxTUHnZwKmOjOIqsJ2077M'); //get your ownn Browser API KEY
        gapi.client.load('urlshortener', 'v1', function () {
        });

    }
    window.onload = load;




}])
    .run(['ngMeta', function (ngMeta) {
        ngMeta.init();
    }]);
;
