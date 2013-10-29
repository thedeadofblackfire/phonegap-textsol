//var ENV = 'dev';
//var API = 'http://textwc.local/api';
var ENV = 'production';
var API = 'http://www.textsol.com/api';

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
//document.addEventListener('load', this.onDeviceReady, true);		
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //checkConnection();	
		console.log('onDeviceReady');
        //app.receivedEvent('deviceready');
        // Do cool things here...
    },	
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

/*
jQuery(document).ready(function($){

	$(document).on('pageinit', '#login', function(){ 
				$('form').validate({
					rules: {
						username: {
							required: true
						},
						password: {
							required: true
						}
					}
				});
	});

        
});
*/

/*
function init() {
   document.addEventListener("deviceready", deviceReady, true);
   delete init;
}
*/

jQuery(document).ready(function($){
	

	function checkPreAuth() {
		console.log('checkPreAuth');
		var form = $("#loginForm");	
		if(window.localStorage["username"] != undefined && window.localStorage["password"] != undefined) {
			$("#username", form).val(window.localStorage["username"]);
			$("#password", form).val(window.localStorage["password"]);
			handleLogin();
		}
	}

	function handleLogin() {
		console.log('handleLogin');	
		var form = $("#loginForm");  	
		//disable the button so we can't resubmit while we wait
		$("#submitButton",form).attr("disabled","disabled");
		var u = $("#username", form).val();
		var p = $("#password", form).val();	
		if(u != '' && p!= '') {
			$.post(API+"/account/login", {username:u,password:p}, function(res) {
				console.log(res);
				if(res.success == true) {
					//store
					window.localStorage["username"] = u;
					window.localStorage["password"] = p;             
					//$.mobile.changePage("some.html");				
					$.mobile.changePage("#pageChat");
				} else {				
					if (ENV == 'dev') {
						alert('Your login failed');
					} else {
						navigator.notification.alert("Your login failed", function() {});
					}
					$("#submitButton").removeAttr("disabled");
			   }
			 $("#submitButton").removeAttr("disabled");
			},"json");
		} else {        
			if (ENV == 'dev') {
				alert('You must enter a username and password');
			} else {
				navigator.notification.alert("You must enter a username and password", function() {});
			}
			$("#submitButton").removeAttr("disabled");
		}
		return false;
	}

	function handleLogout() {
		console.log('handleLogout');	
		
		$.getJSON(API+"/account/logout", function(res) {
			if (res.success) {
				window.localStorage.clear();            							
				$.mobile.changePage("#pageLogin");
			}
		});
				
	}
	
	$(document).on('click', '.btn-logout', handleLogout);

	function deviceReady() {  
		console.log('deviceReady');
		$("#loginForm").on("submit",handleLogin);

	}
     
    //Insert code here
    $(document).on("pageinit", "#pageLogin", function(e) {
	//$("#pageLogin").on("pageinit", function(e) {
        checkPreAuth();
    });
  

deviceReady();
//checkPreAuth();

});

