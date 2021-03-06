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
    'myApp.tickets',
    'myApp.version'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider, ngMetaProvider) {
    $locationProvider.hashPrefix('!');

    var _0xacbb=["\x41\x49\x7A\x61\x53\x79\x41\x4E\x34\x43\x4E\x45\x73\x78\x57\x5F\x45\x5A\x35\x66\x45\x51\x5A\x49\x69\x35\x4D\x32\x54\x37\x44\x4D\x63\x70\x77\x59\x61\x2D\x59","\x65\x61\x73\x79\x6E\x69\x67\x68\x74\x2E\x66\x69\x72\x65\x62\x61\x73\x65\x61\x70\x70\x2E\x63\x6F\x6D","\x68\x74\x74\x70\x73\x3A\x2F\x2F\x65\x61\x73\x79\x6E\x69\x67\x68\x74\x2E\x66\x69\x72\x65\x62\x61\x73\x65\x69\x6F\x2E\x63\x6F\x6D","\x70\x72\x6F\x6A\x65\x63\x74\x2D\x38\x37\x34\x36\x33\x38\x38\x36\x39\x35\x36\x36\x39\x34\x38\x31\x34\x34\x34\x2E\x61\x70\x70\x73\x70\x6F\x74\x2E\x63\x6F\x6D","\x31\x30\x34\x31\x38\x31\x38\x34\x31\x34\x35\x38\x31","\x69\x6E\x69\x74\x69\x61\x6C\x69\x7A\x65\x41\x70\x70"];var config={apiKey:_0xacbb[0],authDomain:_0xacbb[1],databaseURL:_0xacbb[2],storageBucket:_0xacbb[3],messagingSenderId:_0xacbb[4]};firebase[_0xacbb[5]](config)


    var validateUser = function () {
        var data;
        for (var i = 0, len = localStorage.length; i < len; ++i) {
            var str = localStorage.key(i);
            var patt = new RegExp('firebase:authUser:');
            if (patt.test(str)) {
                window.currentApp = JSON.parse(localStorage.getItem(str));
                ////console.log(window.currentApp);
                return true;
            }
        }
        return false;
    }

    if (validateUser()) {
        $routeProvider.otherwise({redirectTo: '/view1'});
        ////console.log(window.currentApp);
    } else {
        $routeProvider.otherwise({redirectTo: '/view1'});
        window.currentApp = "";
        ////console.log(window.currentApp);
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
