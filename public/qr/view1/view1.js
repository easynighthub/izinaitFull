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
            var currentDay = new Date().getTime();

            firebase.database().ref('doormans/').child(doorman.$id || doorman.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                //console.log(exists);

                if (exists == true) {
                    var ref = firebase.database().ref('/doormans/').child(doorman.$id || doorman.uid);
                    var doormLocal = $firebaseObject(ref);
                    doormLocal.$loaded().then(function () {
                        doormanLogeado = doormLocal;
                        //console.log(doormanLogeado);

                        var newEvent = firebase.database().ref('/events/').orderByChild('toHour').startAt(currentDay);
                        var newEventFB = $firebaseArray(newEvent);

                        if(doormanLogeado.events) {
                            $scope.eventsId = Object.keys(doormanLogeado.events);
                            //console.log($scope.eventsId);

                            newEventFB.$loaded().then(function(){
                                $scope.allEvents = newEventFB;
                                $scope.allEvents.forEach(function (j) {
                                    $scope.eventsId.forEach(function (x) {
                                        if(j.$id == x){
                                            $scope.events.push(j);
                                            //console.log($scope.events);
                                        };
                                    });

                                });
                            });
                        }else
                        {
                            alert("no tiene eventos asignado");
                        }



                    });
                } else {
                    window.currentDoorman = "";
                    doormanLogeado = "";
                    //console.log(window.currentDoorman + " NO ENTRE");
                };

            });


            $scope.administrar = function(event) {
                localStorage.setItem("eventIdSelect", event.$id);
                location.href = "#!/event?id=" + event.$id;
            }














        }]);

