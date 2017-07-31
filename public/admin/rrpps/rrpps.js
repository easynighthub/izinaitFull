/**
 * Created by Andro Ostoic on 11-12-2016.
 */


'use strict';

angular.module('myApp.rrpps', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/rrpps', {
            templateUrl: 'rrpps/rrpps.html',
            controller: 'rrppsCtrl'
        });
    }])

    .controller('rrppsCtrl', ['$scope', '$rootScope', '$firebaseArray', '$firebaseObject','$mdDialog',
        function($scope, $rootScope, $firebaseArray, $firebaseObject,$mdDialog) {



            $(configuracion).addClass( "active" );
            $(eventos).removeClass( "active" );
            var admin = window.currentAdmin ;
            var adminLogeado = "";
            $scope.rrpps = [];
            $scope.Allrrpps = [];


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
                                traerRRPPS(adminLogeado.idClubWork);
                            });

                        };
                        console.log(adminLogeado);

                        document.getElementById('BarraCargando').style.display = 'none';
                        document.getElementById('panelPrincipal').style.display = 'block';
                        $('.tituloIziboss').text("Relaciones Publicas");
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                };

            });

            var traerRRPPS = function (clubId) {
                $scope.rrpps = [];
                $scope.Allrrpps = [];

                var rrpps = $firebaseArray(firebase.database().ref('admins/'+adminLogeado.$id+'/rrpps'));

                rrpps.$loaded().then(function(){
                    console.log(rrpps);
                    $scope.Allrrpps = rrpps;
                    $scope.Allrrpps.forEach(function (x) {
                        console.log(x.clubs);
                        if(x.bloqueado == true){
                            var buscarNick = $firebaseObject(firebase.database().ref('rrpps/'+x.$id));
                            buscarNick.$loaded().then(function () {
                                x.nickName = buscarNick.nickName;
                                $scope.rrpps.push(x);
                            });
                        }else{
                            if(Object.keys(x.clubs).indexOf(clubId) >= 0){
                                var buscarNick = $firebaseObject(firebase.database().ref('rrpps/'+x.$id));
                                buscarNick.$loaded().then(function () {
                                    x.nickName = buscarNick.nickName;
                                    $scope.rrpps.push(x);
                                });
                            }
                        }





                    });
                });
            };

            $scope.agregarRRPP = function() {
                // Appending dialog to document.body to cover sidenav in docs app
                var confirm = $mdDialog.prompt()
                    .title('Cual es el correo del RRPP que deseas agregar?')
                    .textContent('Si el correo existe se asignara automaticamente, si no, se creeara y se le notificara con correo al RRPP ingresado.')
                    .placeholder('Correo Electronico')
                    .ariaLabel('Correo Electronico')
                    .initialValue('')
                    .ok('Asignar!')
                    .cancel('Cancelar');

                $mdDialog.show(confirm).then(
                    function(result) {

                    if(validateEmail(result)){
                        var existeEnAdmin = false;
                        console.log($scope.rrpps);
                        $scope.rrpps.forEach(function (rrpp) {  //rrpps del clubs
                            if(rrpp.email == result){
                                existeEnAdmin = true;
                            };
                        });
                        if(existeEnAdmin){
                            alert('ESTE CORREO YA EXISTE');

                        }else
                        {
                            var todosLosRRPPs = $firebaseObject(firebase.database().ref('rrpps'));
                            todosLosRRPPs.$loaded().then(function () {
                                var existeEnBaseDeDatos = false;
                                todosLosRRPPs.forEach(function (x) {
                                    if(x.email == result){
                                        console.log(x);
                                        firebase.database().ref('admins/'+adminLogeado.$id+'/rrpps/'+x.uid).update({
                                            uid:x.uid,
                                            bloqueado:false,
                                            visible:true,
                                            email:x.email,
                                            name:name
                                        });
                                        firebase.database().ref('admins/'
                                            +adminLogeado.$id
                                            +'/rrpps/'
                                            +x.uid
                                            +'/clubs/'
                                            +adminLogeado.idClubWork).set(true);
                                        traerRRPPS(adminLogeado.idClubWork);
                                        existeEnBaseDeDatos = true;
                                    };
                                });
                                if(existeEnBaseDeDatos){
                                    alert('AGREGADO CON EXITO');

                                }else  // CREAR RELACIONADOR PUBLICO Y ENVIAR CORREO
                                {

                                }
                            });
                        }

                    };
                    //exitoso
                    }
                    );
            };

            function validateEmail(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            };

            $scope.borrarRRPPdelClub = function (rrppSelect) {

                var confirm = $mdDialog.confirm()
                    .title('Desea eliminar este relacionador publico del este club?')
                    .textContent('')
                    .ariaLabel('Lucky day')
                    .targetEvent(rrppSelect)
                    .ok('ELIMINAR')
                    .cancel('CANCELAR');

                $mdDialog.show(confirm).then(function() {
                    console.log((Object.keys(confirm._options.targetEvent.clubs).length));
                    console.log(confirm._options.targetEvent);
                    if(Object.keys(confirm._options.targetEvent.clubs).length >1){
                        firebase.database().ref(
                            'admins/'
                            +adminLogeado.$id
                            +'/rrpps/'
                            +confirm._options.targetEvent.$id
                            +'/clubs/'
                            +adminLogeado.idClubWork).set(null);
                        traerRRPPS(adminLogeado.idClubWork);


                        $.ajax({
                            url: 'http://www.abcs.cl/correo/contact_me.php',
                            type: "POST",
                            data: {
                                name: '1111',
                                phone: '11111',
                                email: confirm._options.targetEvent.email,
                                message: "fuiste eliminado de rrpp"
                            },
                            cache: false,
                            success: function() {
                console.log("siiiiiiiiiiiiiiiiiiiiiii");
                            },
                            error: function() {
                    console.log("noooooooooooooooooooooo");
                            },
                        });

                    }else
                    {
                        firebase.database().ref(
                            'admins/'
                            +adminLogeado.$id+
                            '/rrpps/'
                            +confirm._options.targetEvent.$id
                        ).set(null);
                        traerRRPPS(adminLogeado.idClubWork);
                    }
                }, function() {

                });

            };











           
        }]);
