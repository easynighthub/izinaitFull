var loginDoorman = document.getElementById('loginDoorman');


loginDoorman.addEventListener('click', function () {
    var correoDoorman = document.getElementById('correoDoorman').value;
    var pwDoorman = document.getElementById('pwDoorman').value;
    console.log(correoDoorman);
    console.log(pwDoorman);


    firebase.auth().signInWithEmailAndPassword(correoDoorman, pwDoorman).then(
        function(s){
            console.log(s);
            firebase.database().ref('/doormans/' + s.uid).once('value').then(function(snapshot) {
                if (snapshot.val() != null)
                    window.location.href = 'qr';
                else {
                    alert('ESTE CORREO NO ES DOORMAN DE NI UN EVENTO');
                    firebase.auth().signOut();
                }
            });
        },
        function(e) {
            console.log(e);
            alert('ESTE USUARIO NO EXISTE EN NUESTRA BASE DE DATOS, PONGA SE ENCONTACTO CON IZINAIT');
        }
    );



});

