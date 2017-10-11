'use strict';

angular.module('myApp.view1', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {

                $routeProvider.when('/view1', {
                templateUrl: 'view1/view1.html',
                controller: 'View1Ctrl',
                    data: {
                        meta: {
                            'title': 'TODOS LOS EVENTOS',
                        }
                    }
            }
        );
    }])
    .controller('View1Ctrl', ['$scope','$http', '$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope,$http, $firebaseObject, $firebaseArray, $filter, $rootScope, $routeProvider) {


            var user = window.currentApp ;
            var usuarioLogeado = "";

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
                        $('.pruebacon').removeClass("contenedor");
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





            $scope.filterDateInput = new Date();

     /*  var users = $firebaseArray(firebase.database().ref().child('users'));
            users.$loaded().then(function () {
                console.log(users);
                users.forEach(function (x) {

                    firebase.database().ref('users/' + x.$id).update({
                        events: null,
                        asistProd: null,
                        history: null,
                        provider: null,
                        type: null,
                        tickets: null,
                        qvoUser : null,

                    });
                });
            }); */


              /*    if(x.email != "izi@nait.com" || x.email != "null@izinait.com" ){
                      if(x.facebookId){

                          var url = "https://us-central1-project-8746388695669481444.cloudfunctions.net/createUserQvo?email="
                              +x.email
                              +"&name="
                              +x.displayName

                          $http({
                              method: 'GET',
                              url: url,
                              crossOrigin: true,
                          }).then(function successCallback(response) {
                              console.log(response);
                              if(response.data.error != undefined){
                                  alert("ESTE CORREO YA EXISTE");
                              }
                              else{

                                  firebase.database().ref('users/' + x.id).update(
                                      {
                                          qvoUser : true
                                      }
                                  );

                                  firebase.database().ref('userQvo/' + x.id).set(
                                      {
                                          id : x.id,
                                          userQvoEmail : response.data.email,
                                          userQvoId : response.data.id,
                                          userQvoName: response.data.name
                                      }

                                  );

                                  console.log("exito");
                              };
                          }, function errorCallback(response) {
                          });


                      }

                  }
               */
/*
              });
            });  */

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

