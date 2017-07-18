angular.module('myApp.crearEvento', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/crearEvento', {
            templateUrl: 'crearEvento/crearEvento.html',
            controller: 'crearEventoCtrl'
        });
    }])

    .controller('crearEventoCtrl', ['$scope', '$routeParams','$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope,$routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope) {



            $(eventos).addClass( "active" );
            $(configuracion).removeClass( "active" );

            var admin = window.currentAdmin;
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


                            var clubNombreMostrar = [];
                            var clubNombre = firebase.database().ref().child('clubs');
                            $scope.clubNombre = $firebaseArray(clubNombre);
                            $scope.clubNombre.$loaded().then(function() {

                                clubNombreMostrar = $scope.clubNombre;
                                clubNombreMostrar.forEach(function (x) {

                                    if(x.$id == adminLogeado.idClubWork){
                                        $scope.clubName = x.name;
                                        console.log($scope.clubName);
                                    }
                                });
                            });



                        $('.tituloIziboss').text("Crear evento");

                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                };

            });


          $scope.enviarEmail =  function () {

                var para       = "androstoic@gmail.com";
                var cc         = "androstoic@gmail.com"
                var cco        = "androstoic@gmail.com"
                var asunto     = "androstoic@gmail.com"
                var cuerpo     = "androstoic@gmail.com"

                var mensaje = "mailto:" + para +
                    "?cc=" + cc +
                    "&bcc=" + cco +
                    "&subject=" + escape(asunto) +
                    "&body=" + escape(cuerpo);

                window.location = mensaje;
            }



        }]);