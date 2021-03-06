/**
 * Created by Andro Ostoic on 11-12-2016.
 */


'use strict';

angular.module('myApp.rrpps', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/rrpps', {
            templateUrl: 'rrpps/rrpps.html',
            controller: 'rrppsCtrl'
        });
    }])

    .controller('rrppsCtrl', ['$scope', '$rootScope', '$firebaseArray', '$firebaseObject', '$mdDialog',
        function ($scope, $rootScope, $firebaseArray, $firebaseObject, $mdDialog) {


            $(sideEventos).removeClass("active");
            $(crearEventos).removeClass("active");

            $(verEventosFuturos).removeClass("active");
            $(verEventosPasados).removeClass("active");
            $(sideClientes).removeClass("active");
            $(sideRrpp).addClass("active");
            $(sideDoorman).removeClass("active");
            $(contenido).css("padding-top", "30px ");
            $('.main-panel').perfectScrollbar('update');

            var admin = window.currentAdmin;
            var adminLogeado = "";
            $scope.rrpps = [];
            $scope.Allrrpps = [];


            firebase.database().ref('admins/').child(admin.$id || admin.uid || 'offline').once('value', function (snapshot) {
                var exists = (snapshot.val() !== null);
                ////console.log(exists);
                if (exists == true) {
                    var ref = firebase.database().ref('/admins/').child(admin.$id || admin.uid);
                    var adminLocal = $firebaseObject(ref);
                    adminLocal.$loaded().then(function () {
                        adminLogeado = adminLocal;
                        //$('.photo').prepend($('<img>', {id: 'theImg', src: adminLogeado.picture}));
                        if (adminLogeado.idClubWork == false) {
                            ObtenerClub(adminLogeado);
                        } else {
                            var clubNombreMostrar = [];
                            var clubNombre = firebase.database().ref().child('clubs');
                            $scope.clubNombre = $firebaseArray(clubNombre);
                            $scope.clubNombre.$loaded().then(function () {

                                clubNombreMostrar = $scope.clubNombre;
                                clubNombreMostrar.forEach(function (x) {
                                    if (x.$id == adminLogeado.idClubWork) {
                                        $('.clubSelecionado').text(x.name + " ");
                                        $(".clubSelecionado").append("<b class='caret'> </b>");
                                        $('.photo').prepend($('<img>', {id: 'theImg', src: x.clubLogo}));
                                        $(theImg).css("height", "-webkit-fill-available");
                                    }
                                });
                                traerRRPPS(adminLogeado.idClubWork);
                            });

                        }
                        ;
                        ////console.log(adminLogeado);

                        document.getElementById('BarraCargando').style.display = 'none';
                        document.getElementById('panelPrincipal').style.display = 'block';
                        $('.tituloIziboss').text("Relaciones Publicas");
                        $('.no-js').removeClass('nav-open');
                    });
                } else {
                    window.currentAdmin = "";
                    $scope.adminLogeado = "";
                    window.location = "https://www.izinait.com/admin.html";
                }
                ;

            });

            var traerRRPPS = function (clubId) {
                $scope.rrpps = [];
                $scope.Allrrpps = [];

                var rrpps = $firebaseArray(firebase.database().ref('admins/' + adminLogeado.$id + '/rrpps'));

                rrpps.$loaded().then(function () {
                    ////console.log(rrpps);
                    $scope.Allrrpps = rrpps;
                    $scope.Allrrpps.forEach(function (x) {
                        ////console.log(x.clubs);
                        if (x.bloqueado == true) {
                            var buscarNick = $firebaseObject(firebase.database().ref('rrpps/' + x.$id));
                            buscarNick.$loaded().then(function () {
                                x.nickName = buscarNick.nickName;
                                $scope.rrpps.push(x);
                            });
                        } else {
                            if (Object.keys(x.clubs).indexOf(clubId) >= 0) {
                                var buscarNick = $firebaseObject(firebase.database().ref('rrpps/' + x.$id));
                                buscarNick.$loaded().then(function () {
                                    x.nickName = buscarNick.nickName;
                                    $scope.rrpps.push(x);
                                });
                            }
                            ;
                        }
                        ;

                    });
                });
            };

            $scope.agregarRRPP = function () {
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
                    function (result) {

                        if (validateEmail(result)) {
                            var existeEnAdmin = false;
                            ////console.log($scope.rrpps);
                            $scope.rrpps.forEach(function (rrpp) {  //rrpps del clubs
                                if (rrpp.email == result) {
                                    existeEnAdmin = true;
                                }
                                ;
                            });
                            if (existeEnAdmin) {
                                alert('ESTE CORREO YA EXISTE');

                            } else {
                                var todosLosRRPPs = $firebaseArray(firebase.database().ref('rrpps'));
                                todosLosRRPPs.$loaded().then(function () {
                                    var existeEnBaseDeDatos = false;
                                    todosLosRRPPs.forEach(function (x) {
                                        console.log(x);
                                        if (x.email == result) {
                                            ////console.log(x);
                                            firebase.database().ref('admins/' + adminLogeado.$id + '/rrpps/' + x.$id).update({
                                                uid: x.$id,
                                                bloqueado: false,
                                                visible: true,
                                                email: x.email,
                                                name: name
                                            });
                                            firebase.database().ref('admins/'
                                                + adminLogeado.$id
                                                + '/rrpps/'
                                                + x.$id
                                                + '/clubs/'
                                                + adminLogeado.idClubWork).set(true);
                                            traerRRPPS(adminLogeado.idClubWork);
                                            existeEnBaseDeDatos = true;
                                        }
                                        ;
                                    });
                                    if (existeEnBaseDeDatos) {

                                        alert('AGREGADO CON EXITO');

                                    } else  // CREAR RELACIONADOR PUBLICO Y ENVIAR CORREO
                                    {

                                    }
                                });
                            }

                        }
                        ;
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
                    .title('¿Desea eliminar RR.PP?')
                    .textContent('')
                    .ariaLabel('Lucky day')
                    .targetEvent(rrppSelect)
                    .ok('ELIMINAR')
                    .cancel('CANCELAR');

                $mdDialog.show(confirm).then(function () {
                    ////console.log((Object.keys(confirm._options.targetEvent.clubs).length));
                    ////console.log(confirm._options.targetEvent);
                    if (Object.keys(confirm._options.targetEvent.clubs).length > 1) {
                        firebase.database().ref(
                            'admins/'
                            + adminLogeado.$id
                            + '/rrpps/'
                            + confirm._options.targetEvent.$id
                            + '/clubs/'
                            + adminLogeado.idClubWork).set(null);
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
                            success: function () {
                                ////console.log("siiiiiiiiiiiiiiiiiiiiiii");
                            },
                            error: function () {
                                ////console.log("noooooooooooooooooooooo");
                            },
                        });

                    } else {
                        firebase.database().ref(
                            'admins/'
                            + adminLogeado.$id +
                            '/rrpps/'
                            + confirm._options.targetEvent.$id
                        ).set(null);
                        traerRRPPS(adminLogeado.idClubWork);
                    }
                }, function () {

                });

            };


            /////////////////////////////////////////////////////////


            $scope.showSwal = function (type) {

                swal({
                    title: 'Añadir RR.PP',
                    html: '<form  action="" method="">' +
                    '<div class="input-group">' +
                    '<span class="input-group-addon">' +
                    '<i class="material-icons">face</i>' +
                    '</span>' +
                    '<input type="text" id="nombre" class="form-control" placeholder="Nombre...">' +
                    '<span class="input-group-addon">' +
                    '<i class="material-icons">email</i>' +
                    '</span>' +
                    '<input class="form-control"  id="correoRrpp" name="email" placeholder="Email..." type="email" required="true" aria-required="true">' +
                    '</div>' +
                    '</form>'
                    ,
                    showCancelButton: true,
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: false
                }).then(function (result) {

                    ////console.log(result);

                    swal({
                        type: 'success',
                        html: 'El rr.pp: <strong>' +
                        $('#correoRrpp').val() +'</strong> creado con éxito',
                        confirmButtonClass: 'btn btn-success',
                        buttonsStyling: false

                    })
                }).catch(swal.noop)

            }

            $scope.permisos =function (rrpp) {

                console.log(rrpp)

                $mdDialog.show({
                    controller: ControllerDialogAgregarCortesias,
                    templateUrl: 'dialogAgregarCortesias',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    locals: {
                        rrpp: rrpp
                    }
                });

            };

            function ControllerDialogAgregarCortesias($scope, $mdDialog, $timeout, $q, $log,rrpp) {

                $scope.rrpp = rrpp;
             console.log($scope.rrpp);
             console.log(adminLogeado.idClubWork);

             angular.forEach(rrpp.cortesias , function (x,key,value) {
            if(key == adminLogeado.idClubWork){
                $scope.general = x.general;
                $scope.vip = x.vip;
                $scope.vipMesa = x.vipMesa;
                 }

             });


             $scope.guardarCortesias = function () {

                 if( $scope.general >= 0){
                     if( $scope.vip >= 0){
                         if( $scope.vipMesa >=0){

                             firebase.database().ref('admins/' +  adminLogeado.$id + '/rrpps/' + $scope.rrpp.$id+'/cortesias/'+adminLogeado.idClubWork)
                                 .update(
                                     {
                                         general : $scope.general,
                                         vip : $scope.vip,
                                         vipMesa : $scope.vipMesa
                                     }
                                 );
                             $mdDialog.hide();
                         }
                     }
                 }



             };







                $scope.hide = function () {
                    $mdDialog.hide();
                };

                $scope.cancel = function () {
                    $mdDialog.cancel();

                };


            };


            var oFileIn;

           /* $(function() {
                oFileIn = document.getElementById('my_file_input');
                if(oFileIn.addEventListener) {
                    oFileIn.addEventListener('change', filePicked, false);
                }
            });


            function filePicked(oEvent) {
                // Get The File From The Input
                var oFile = oEvent.target.files[0];
                var sFilename = oFile.name;
                // Create A File Reader HTML5
                var reader = new FileReader();

                // Ready The Event For When A File Gets Selected
                reader.onload = function(e) {
                    var data = e.target.result;
                    var cfb = XLS.CFB.read(data, {type: 'binary'});
                    var wb = XLS.parse_xlscfb(cfb);
                    // Loop Over Each Sheet
                    wb.SheetNames.forEach(function(sheetName) {
                        // Obtain The Current Row As CSV
                        var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]);
                        var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);

                        $("#my_file_output").html(sCSV);
                        console.log(oJS)
                    });
                };

                // Tell JS To Start Reading The File.. You could delay this if desired
                reader.readAsBinaryString(oFile);
            }
 */

            /////////////////////////////////////////////////////////
        }]);
