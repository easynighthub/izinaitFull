
'use strict';

angular.module('myApp.detalleClub', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/detalleClub', {
            templateUrl: 'detalleClub/detalleClub.html',
            controller: 'viewdetalleClub'
        });
    }])
    .controller('viewdetalleClub', ['$scope', '$routeParams', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope', '$http',
        function ($scope, $routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope, $http) {

            var user = window.currentApp;
            var usuarioLogeado = "";

            var clubID = $routeParams.id; //recibir id por url despues de id
            var instagramID;
            $scope.instaItems = false;
            $scope.eventsItems = false;
            $scope.events = [];

            firebase.database().ref('users/').child(user.$id || user.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);

                if (exists == true) {
                    var ref = firebase.database().ref('/users/').child(user.$id || user.uid);
                    var usersLocal = $firebaseObject(ref);
                    usersLocal.$loaded().then(function () {
                        usuarioLogeado = usersLocal;
                        console.log(usuarioLogeado);
                        //  $('.user-header .imagen').text(usersLocal.picture);
                        $('.codigoAcceder').text("Tú Codigo");
                        console.log(window.currentApp + " ENTRE");
                    });
                } else {
                    window.currentApp = "";
                    $scope.usuarioLogeado = "";
                    $('.codigoAcceder').text("acceder");
                    console.log(window.currentApp + " NO ENTRE");
                };

            });


                var getClub = $firebaseObject(firebase.database().ref().child('clubs/' + clubID));
                getClub.$loaded().then(function () {
                    $scope.club = getClub;
                    getEvents();
                    getInstagramGallery($scope.club.instagramId);
                    document.getElementById('BarraCargando').style.display = 'none';
                    document.getElementById('detalleClub').style.display = 'block';
                });

                var getEvents = function () {
                    if($scope.club.events){
                        angular.forEach(Object.keys($scope.club.events), function (event) {
                            var eventsRequest = $firebaseObject(firebase.database().ref('/events/' + event));
                            eventsRequest.$loaded().then(function () {
                                getFuturesEvents(eventsRequest);
                            });
                        });
                    }

                };

            var getFuturesEvents = function (event) {
                var currentDay = new Date().getTime();
                var visible = true;
                if (currentDay < event.toHour) {
                    if (visible = event.visible) {

                        $scope.events.push(event);
                        $scope.eventsItems = true;
                        return true;
                    }
                }
                else
                    return false;
            };

            $scope.goEvent = function (event) {
                console.log(event + "log click");
                $rootScope.selectedEvent = event;
                location.href = "#!/detalleEvento?id=" + event.$id;
            };


            function getInstagramGallery(instagramId) {
                var base = "https://igapi.ga";
                var request = "/" + instagramId + "/media/?count=10";
                var url = base + request;

                $scope.instagramIdTitle = "@" + instagramId;

                $.ajax({
                    url: url,
                    dataType: 'jsonp',
                    success: function (json) {
                        setInstagramScope(json.items);
                        console.log(json.items);
                    },
                    error: function (response) {
                        console.log("Error");
                        console.log(response);
                    }
                });
            }

            function setInstagramScope(items) {

                $scope.instagramItems = items;
                if ($scope.instagramItems != null) {
                    $scope.instaItems = true;
                }


            }
        }]);