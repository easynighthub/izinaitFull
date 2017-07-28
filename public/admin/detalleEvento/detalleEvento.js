/**
 * Created by andro on 24-07-2017.
 */

angular.module('myApp.detalleEvento', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/detalleEvento', {
            templateUrl: 'detalleEvento/detalleEvento.html',
            controller: 'detalleEventoCtrl'
        });
    }])

    .controller('detalleEventoCtrl', ['$scope', '$routeParams','$firebaseObject', '$firebaseArray', '$filter', '$rootScope',
        function ($scope,$routeParams, $firebaseObject, $firebaseArray, $filter, $rootScope) {



            $(eventos).addClass( "active" );
            $(configuracion).removeClass( "active" );


            var admin = window.currentAdmin;
            var adminLogeado = "";
            var eventId = $routeParams.id; // id del evento entregador por url
            var event;
            $scope.totalListasGratis = 0;
            $scope.impresionesTotales = 0;

            var eventCargado = firebase.database().ref('/events/').child(eventId);
            var eventCargadoRQ = $firebaseObject(eventCargado);
            eventCargadoRQ.$loaded().then(function () {
                event = eventCargadoRQ;
                console.log(event);
            });

            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function(snapshot) {
                var exists = (snapshot.val() !== null);
                console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        if(adminLogeado.idClubWork == false){
                            ObtenerClub (adminLogeado);
                        }else{
                            var clubNombreMostrar = [];
                            var clubNombre = firebase.database().ref().child('clubs');
                            $scope.clubNombre = $firebaseArray(clubNombre);
                            $scope.clubNombre.$loaded().then(function() {

                                clubNombreMostrar = $scope.clubNombre;
                                clubNombreMostrar.forEach(function (x) {
                                    if(x.$id == adminLogeado.idClubWork){
                                        $('.clubSelecionado').text(x.name +" ");
                                        $( ".clubSelecionado" ).append( "<b class='caret'> </b>" );
                                    }
                                });
                            });

                            var listaGratis = firebase.database().ref('/events/' + eventId + '/asist');
                            var listaGratisRQ = $firebaseObject(listaGratis);
                            listaGratisRQ.$loaded().then(function () {
                                $scope.listaGratis = listaGratisRQ;
                                $scope.listaGratis.forEach(function (x) {
                                    console.log(adminLogeado);
                                    console.log(x.totalList);
                                    $scope.totalListasGratis =$scope.totalListasGratis+ x.totalList;
                                });
                            });

                            var impresiones = firebase.database().ref('/impresiones/' + eventId );
                            var impresionesRQ = $firebaseArray(impresiones);
                            impresionesRQ.$loaded().then(function () {
                                $scope.impresionesRRPP = impresionesRQ;
                                $scope.impresionesRRPP.forEach(function (j) {

                                    angular.forEach(event.rrpps, function(rp){
                                        if (j.$id == rp.uid){
                                            j.nameRRPP = rp.email;

                                            $scope.impresionesTotales = $scope.impresionesTotales+ j.openLink;
                                        }
                                    });
                                });
                            });

                            var tickets = firebase.database().ref('/tickets/' + eventId );
                            var ticketsRQ = $firebaseArray(tickets);
                            ticketsRQ.$loaded().then(function () {
                                $scope.ticketsEvent = ticketsRQ;
                                $scope.ticketsEvent.forEach(function (x) {
                                    console.log(x);
                                });
                            });


                        };
                        console.log(adminLogeado);

                        $('.tituloIziboss').text("Detalle Evento");
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                };

            });







        }]);
