/**
 * Created by andro on 23-08-2017.
 */


var _0xacbb=["\x41\x49\x7A\x61\x53\x79\x41\x4E\x34\x43\x4E\x45\x73\x78\x57\x5F\x45\x5A\x35\x66\x45\x51\x5A\x49\x69\x35\x4D\x32\x54\x37\x44\x4D\x63\x70\x77\x59\x61\x2D\x59","\x65\x61\x73\x79\x6E\x69\x67\x68\x74\x2E\x66\x69\x72\x65\x62\x61\x73\x65\x61\x70\x70\x2E\x63\x6F\x6D","\x68\x74\x74\x70\x73\x3A\x2F\x2F\x65\x61\x73\x79\x6E\x69\x67\x68\x74\x2E\x66\x69\x72\x65\x62\x61\x73\x65\x69\x6F\x2E\x63\x6F\x6D","\x70\x72\x6F\x6A\x65\x63\x74\x2D\x38\x37\x34\x36\x33\x38\x38\x36\x39\x35\x36\x36\x39\x34\x38\x31\x34\x34\x34\x2E\x61\x70\x70\x73\x70\x6F\x74\x2E\x63\x6F\x6D","\x31\x30\x34\x31\x38\x31\x38\x34\x31\x34\x35\x38\x31","\x69\x6E\x69\x74\x69\x61\x6C\x69\x7A\x65\x41\x70\x70"];var config={apiKey:_0xacbb[0],authDomain:_0xacbb[1],databaseURL:_0xacbb[2],storageBucket:_0xacbb[3],messagingSenderId:_0xacbb[4]};firebase[_0xacbb[5]](config);

window.fbAsyncInit = function () {
    FB.init({
        appId: '1138664439526562',
        xfbml: true,
        version: 'v2.8'
    });
    FB.AppEvents.logPageView();
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/es_LA/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


var signInButtonFacebook = document.getElementById('sign-in-facebook');
var token = "";
var user = "";

signInButtonFacebook.addEventListener('click', function() {

    firebase.auth().signOut();
    window.currentRRPP ="";
    var AdminLogeado = "";

    var USERS_LOCATION = 'rrpps/';
    var database = firebase.database();
    var provider = new firebase.auth.FacebookAuthProvider();


    //se agrega el permiso de cumpleaños
    provider.addScope('user_birthday');

    provider.addScope('email');

    provider.addScope('public_profile');


    firebase.auth().signInWithPopup(provider).then(function(result) {


        // This gives you a Google Access Token. You can use it to access the Google API.
        token = result.credential.accessToken;
        // The signed-in user info.
        user = result.user;

        //console.log(token);
        //console.log(user);

        firebase.auth().onAuthStateChanged(onAuthStateChanged);
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
    });

    function writeUserData(response) {
        var adminId = user.uid
        database.ref(USERS_LOCATION + user.uid).update({
            displayName: response.name,
            email: response.email || "null@izinait.com",
            picture: response.picture.data.url,
            birthday: response.birthday || "11/11/1111",
            firstName: response.first_name,
            facebookId: response.id,
            lastName: response.last_name,
            gender : response.gender,
            name: response.name,
            confirm : false,
            nickName:adminId,
            uid : adminId
        });
        database.ref('/nickName/'+user.uid).update({
            uid:adminId,
            nickName:adminId
        });




    };

    function updateData(response) {
        var adminId = user.uid
        database.ref(USERS_LOCATION + user.uid).update({
            displayName: response.name,
            picture: response.picture.data.url,
            firstName: response.first_name,
            lastName: response.last_name,
        });



    };

    function onAuthStateChanged(user) {
        //cleanupUi();
        if (user) {
            FB.api('/me', 'get',
                {
                    access_token: token,
                    fields: 'id, name, email, first_name, last_name, age_range{min}, picture.type(large), birthday, gender'
                },
                function(response) {
                    checkIfUserExists(user.uid, response);
                });
        } else {
            // Display the splash page where you can sign-in.
        }
    }

    function userExistsCallback(exists, response) {
        if (exists) {
            updateData(response);
            setTimeout(function(){window.location.href = 'rrpp'},500); // 3000ms = 3s

        } else {
            writeUserData(response);
            setTimeout(function(){window.location.href = 'rrpp'},500); // 3000ms = 3s

        }
    }

    // Tests to see if /users/<userId> has any data.
    function checkIfUserExists(userId, response) {
        var usersRef = database.ref(USERS_LOCATION);
        usersRef.child(userId).once('value', function(snapshot) {
            var exists = (snapshot.val() !== null);
            userExistsCallback(exists, response);
        });
    }
});

/*
ingresarAdmin.addEventListener('click', function() {



    var email = document.getElementById('correo').value;
    var password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password).then(
        function(s){
            //console.log(s);
            firebase.database().ref('/admins/' + s.uid).once('value').then(function(snapshot) {
                if (snapshot.val() != null)
                    window.location.href = 'admin';

                else {
                    alert('Este usuario no es Admin');
                    firebase.auth().signOut();
                }
            });
        },
        function(e) {
            //console.log(e);
            alert('ESTE USUARIO NO EXISTE EN NUESTRA BASE DE DATOS, PONGA SE ENCONTACTO CON IZINAIT');
            document.getElementById('BarraCargando').style.display = 'none';
            document.getElementById('signIn').style.display = 'block';
        }
    );
});
    */