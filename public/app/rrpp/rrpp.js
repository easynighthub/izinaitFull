/**
 * Created by Andro Ostoic on 03-04-2017.
 */

'use strict';

angular.module('myApp.rrpp', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/rrpp', {
            templateUrl: 'rrpp/rrpp.html',
            controller: 'Viewrrpp'
        });
    }])

    .controller('Viewrrpp', ['$scope','$routeParams' ,'$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function($scope,$routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope) {


            var user = window.currentApp ;
            var usuarioLogeado = "";

          //  var eventId = $routeParams.id;
            var nickName = window.location.href.split("#")[2];
            console.log(nickName);
            $scope.club = [];
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
                        //  $('.codigoAcceder').prepend($('<img>',{id:'theImg',src:usuarioLogeado.picture}))
                        console.log(window.currentApp + " ENTRE");
                        $(navigationexample).removeClass("in");
                    });
                } else {
                    window.currentApp = "";
                    usuarioLogeado = "";
                    $('.codigoAcceder').text("acceder");
                    console.log(window.currentApp + " NO ENTRE");
                    $(navigationexample).removeClass( "in" );
                };

            });



            var buscarNickName = firebase.database().ref('/rrpps/');
            var buscarNickNameRequest = $firebaseArray(buscarNickName);
            var clubsER = $firebaseArray(firebase.database().ref().child('clubs'));
            clubsER.$loaded().then(function(){
            buscarNickNameRequest.$loaded().then(function () {
                $scope.todoslosRRpps = buscarNickNameRequest;
                $scope.rrpps = $scope.todoslosRRpps;
                console.log($scope.rrpps);
                buscarNickName.once("value").then(function (snapshot) {
                    $scope.rrpps.forEach(function (data) {
                        var c = snapshot.child(data.$id + '/nickName/').exists(); // true

                        console.log(data.$id);
                        console.log(data.nickName);
                        if (data.nickName == nickName) {
                            var getRrpp = $firebaseObject(firebase.database().ref().child('rrpps/' + data.$id));
                            console.log("entre a buscar el rrpp por el id " + getRrpp );
                            getRrpp.$loaded().then(function () {
                                $scope.rrpp = getRrpp;
                                console.log("entre a buscar los eventos del rrpp")
                                getEvents();
                            });
                        }

                    });

                });


            });


            });



            var getEvents = function() {
                if($scope.rrpp.events){
                    angular.forEach(Object.keys($scope.rrpp.events), function(event){
                    var eventsRequest = $firebaseObject(firebase.database().ref('/events/' + event));
                    eventsRequest.$loaded().then(function(){
                        getFuturesEvents(eventsRequest);
                        document.getElementById('BarraCargando').style.display = 'none';
                        document.getElementById('eventosRrpp').style.display = 'block';
                    });
                });

                }else
                {

                  location.href = "#!/eventos";
                  alert("el rrpp no tiene eventos");
                    console.log("el rrpp no tiene eventos")
                }

            };

            var getFuturesEvents = function(event) {
                var currentDay = new Date().getTime();
                var visible = true;
                if (currentDay < event.toHour){
                    if(visible = event.visible){

                        $scope.events.push(event);
                        console.log("=================== se muestra")
                        return true;
                    }
                }
                else
                    return false;
            };


            $scope.getClub = function(club) {
                if (club) {
                    var clubKey = Object.keys(club)[0];
                    return $filter('filter')(clubsER, {$id: clubKey})[0].name;
                }
            };

            $scope.goEventRRpp = function(event) {
                console.log(event + "log click");
                $rootScope.selectedEvent = event;
                location.href = "#!/detalleEvento?id="+event.$id+'&friend='+$scope.rrpp.$id;

            };


        }]);
