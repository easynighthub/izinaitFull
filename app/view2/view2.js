'use strict';

angular.module('myApp.view2', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/view2', {
            templateUrl: 'view2/view2.html',
            controller: 'View2Ctrl'
        });
    }])

    .controller('View2Ctrl', ['$scope', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function($scope, $firebaseObject, $firebaseArray, $filter, $rootScope) {

            var user = window.currentApp;
            $scope.usuarioLogeado = "";

            if (user != "") {
                var ref = firebase.database().ref('/users/').child(user.uid);
                var usersLocal = $firebaseObject(ref);
                usersLocal.$loaded().then(function () {
                    $scope.usuarioLogeado = usersLocal;
                    console.log( $scope.usuarioLogeado);
                    $('.nombreUsuario').text( $scope.usuarioLogeado.displayName);
                    //  $('.user-header .imagen').text(usersLocal.picture);
                    $('.modulo').text("Clubs");
                    $('.codigoVisible').text("Tú Codigo");
                    console.log(window.currentApp + " ENTRE");

                });
            } else {
                $('.nombreUsuario').text("BIENVENIDO");
                $('.codigoVisible').text("Obten Codigo");
                $('.modulo').text("Clubs");
                console.log(window.currentApp + " NO ENTRE");
            }





            // obtengo clubs
            var clubsER = firebase.database().ref().child('clubs');
            $scope.clubsER = $firebaseArray(clubsER);
            $scope.clubsER.$loaded().then(function(){
                $scope.allClubs = $scope.clubsER;
                // $scope.clubs = $scope.allClubs;
                // ejecuto llenar clubs y llamo a la funcion filtrar
                $scope.clubs = $filter('filter')($scope.allClubs);
                $scope.clubsFiltradosPorActivo =  $scope.clubs;

                //dejo de mostrar la barra de cargando clubs
                document.getElementById('BarraCargando').style.display = 'none';
            });


            // funcion para filtrar por nombre
            $scope.filterClubsByText = function() {
                $scope.clubs = $filter('filter')($scope.clubsFiltradosPorActivo, {name: $scope.filterNameInput});
            }

            // boton ver todos los clubs
            $scope.seeAllClubs = function() {
                var clubsER = firebase.database().ref().child('clubs');
                $scope.clubsER = $firebaseArray(clubsER);
                $scope.clubsER.$loaded().then(function(){
                    $scope.clubs = $scope.clubsER;
                });
            }


            // boton para entrar al club y ver detalles
            $scope.goToClubDetails = function(club) {
                console.log(club);
                console.log("==============================");
                $rootScope.selectedClub = club;
                location.href = "#!/detalleClub?id="+club.$id;
            }






        }]);