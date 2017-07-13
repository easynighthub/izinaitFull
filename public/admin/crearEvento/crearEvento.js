angular.module('myApp.crearEvento', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/crearEvento', {
            templateUrl: 'crearEvento/crearEvento.html',
            controller: 'crearEventoCtrl'
        });
    }])

    .controller('crearEventoCtrl', ['$scope', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope, $firebaseObject, $firebaseArray, $filter, $rootScope) {




            $(eventos).addClass( "active" );
            $(configuracion).removeClass( "active" );

            var admin = window.currentAdmin ;
            var adminLogeado = "";



            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        console.log(adminLogeado);
                        $('.tituloIziboss').text("Crear evento");
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                };

            });





        }]);