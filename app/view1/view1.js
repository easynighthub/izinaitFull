'use strict';

angular.module('myApp.view1', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
                templateUrl: 'view1/view1.html',
                controller: 'View1Ctrl',
                data: {
                    meta: {
                        'title': 'Home page',
                        'description': 'Home page description'
                    }
                }
            }


        );
    }])



    .controller('View1Ctrl', ['$scope', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope, $firebaseObject, $firebaseArray, $filter, $rootScope) {



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
                    $('.modulo').text("Eventos");
                    $('.codigoVisible').text("Tú Codigo");
                    console.log(window.currentApp + " ENTRE");
                });
            } else {
                $('.nombreUsuario').text("BIENVENIDO");
                $('.codigoVisible').text("Obten Codigo");
                $('.modulo').text("Eventos");
                console.log(window.currentApp + " NO ENTRE");
            };


            $scope.filterDateInput = new Date();



            var clubsER = $firebaseArray(firebase.database().ref().child('clubs'));

            var currentDay = new Date().getTime();
            clubsER.$loaded().then(function () {
                var eventsRequest = $firebaseArray(firebase.database().ref().child('events').orderByChild('toHour').startAt(currentDay));
                eventsRequest.$loaded().then(function () {
                    console.log(eventsRequest);
                    $scope.Allvents = eventsRequest;
                    $scope.events = $scope.Allvents;
                    document.getElementById('BarraCargando').style.display = 'none';
                    document.getElementById('BarraBuscador').style.display = 'block';
                });
            });


            $scope.filterEventsByText = function () {
                $scope.events = $filter('filter')($scope.Allvents, {name: $scope.filterNameInput});
            }

            var comparatorDate = function (value, index, array) {
                var seletedDateInMs = $scope.filterDateInput.getTime().toString();
                var seletedDate = $filter('date')(seletedDateInMs, 'shortDate');
                var eventDate = $filter('date')(value.date, 'shortDate')
                if (eventDate == seletedDate)
                    return true;
                else
                    return false;
            };

            $scope.filterEventsByDate = function () {
                if ($scope.filterDateInput) {
                    $scope.events = $filter('filter')($scope.Allvents, comparatorDate);
                    document.getElementById('verTodosLosEventos').style.display = 'block';
                    document.getElementById('buscarPorFecha').style.display = 'none';

                }
            }

            $scope.seeAllEvents = function () {
                $scope.events = $filter('filter')($scope.Allvents   );
                document.getElementById('verTodosLosEventos').style.display = 'none';
                document.getElementById('buscarPorFecha').style.display = 'block';
            }

            $scope.goToEventDetails = function (event) {
                console.log(event + "log click");
                console.log("hola soy andro el mejor");
                $rootScope.selectedEvent = event;
                location.href = "#!/detalleEvento?id=" + event.$id;
            }

            $scope.getClub = function (club) {
                if (club) {
                    var clubKey = Object.keys(club)[0];
                    return $filter('filter')(clubsER, {$id: clubKey})[0].name;
                }
            }


        }]);

