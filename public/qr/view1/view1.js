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






            var doorman = window.currentDoorman;
            var doormanLogeado = "";
            $scope.allEvents = [];
            $scope.events = [];
            var eventIndex = 0;

            if (doorman != "") {

                var currentDay = new Date().getTime();
                var ref = firebase.database().ref('/doormans/').child(doorman.$id || doorman.uid);
                var newEvent = firebase.database().ref('/events/').orderByChild('toHour').startAt(currentDay);
                var newEventFB = $firebaseArray(newEvent);
                var doormanFB = $firebaseObject(ref);
                doormanFB.$loaded().then(function () {
                    doormanLogeado = doormanFB;
                    console.log(doormanLogeado);
                    console.log(window.currentDoorman + " ENTRE");
                    var doormanData = $firebaseObject(firebase.database().ref('/doormans/').child(doormanLogeado.$id));
                    doormanData.$loaded().then(function(){
                        $rootScope.doormanData = doormanData;
                        if(doormanData.events) {
                            $scope.eventsId = Object.keys(doormanData.events);
                            console.log($scope.eventsId);
                        }
                        newEventFB.$loaded().then(function(){
                            $scope.allEvents = newEventFB;
                            $scope.allEvents.forEach(function (j) {
                                $scope.eventsId.forEach(function (x) {
                                        if(j.$id == x){
                                            $scope.events.push(j);
                                            console.log($scope.events);
                                        }
                                    });

                                });
                        });
                    });
                });
            } else {
                console.log(window.currentDoorman + " NO ENTRE");
            };



            var listaDeUsuariosGratis = firebase.database().ref('/asist/');
            var listaDeUsuariosGratisFB = $firebaseArray(listaDeUsuariosGratis);
            listaDeUsuariosGratisFB.$loaded().then(function(){

            });



            $scope.administrar = function(event) {
                location.href = "#!/event?id=" + event.$id;
            }









        }]);

