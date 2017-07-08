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
            var usuarioLogeado = "";

            firebase.database().ref('users/').child(user.$id || user.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/users/').child(user.$id || user.uid);
                    var usersLocal = $firebaseObject(ref);
                    usersLocal.$loaded().then(function () {
                        usuarioLogeado = usersLocal;
                        console.log( usuarioLogeado);
                        //  $('.user-header .imagen').text(usersLocal.picture);
                        $('.codigoAcceder').text("Tú Codigo");
                        console.log(window.currentApp + " ENTRE");
                        $(navigationexample).removeClass( "in" );
                    });
                } else {
                    firebase.auth().signOut();
                    window.currentApp = "";
                    usuarioLogeado = "";
                    $('.codigoAcceder').text("acceder");
                    console.log(window.currentApp + " NO ENTRE");
                    $(navigationexample).removeClass( "in" );
                };

            });





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