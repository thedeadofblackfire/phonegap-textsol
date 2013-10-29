//var ENV = 'dev';
//var API = 'http://textwc.local/api';
var ENV = 'production';
var API = 'http://www.textsol.com/api';
var user = {};

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
		
		// get automatically user from session
		user = window.sessionStorage.getItem('user');
		if (user) {
			user = JSON.parse(user);	
			console.log('retrieved user: ', user);
		}		
		
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
	

    $(document).on('pagebeforeshow', '#pageSettings', function(){  
		console.log('#pageSettings pagebeforeshow');	
		
		$.getJSON(API+"/account/onlinestatus?user_id="+user.user_id, function(res) {
			console.log(res);
			 var valeur = 'Off';
			 if (res.status == '1') {
				valeur = 'On';
			 }
			 //console.log(valeur);
			 //$('#toggleswitchremotechat option[value=Off]').removeAttr("selected");
			// $('#toggleswitchremotechat option[value=On]').removeAttr("selected");
			// $('#toggleswitchremotechat option[value='+valeur+']').attr("selected", "selected");
			//$('select').selectmenu('refresh', true);
			//$('#toggleswitchremotechat').val(valeur).slider("refresh");
  
		});
		
    });
	
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
		//$("#submitButton",form).attr("disabled","disabled");
		$("#btnLogin").attr("disabled","disabled");
		var u = $("#username", form).val();
		var p = $("#password", form).val();	
		if(u != '' && p!= '') {
			$.post(API+"/account/login", {username:u,password:p}, function(res) {
				console.log(res);
				if(res.success == true) {
					//store
					window.localStorage["username"] = u;
					window.localStorage["password"] = p; 			
					//window.sessionStorage["user_id"] = res.user.user_id; 
					window.sessionStorage.setItem('user', JSON.stringify(res.user));
				    user = res.user;
					//$.mobile.changePage("some.html");				
					$.mobile.changePage("#pageChat");
				} else {				
					if (ENV == 'dev') {
						alert(res.message);
					} else {
						navigator.notification.alert(res.message, function() {});
					}
					$("#btnLogin").removeAttr("disabled");
			   }
			 $("#btnLogin").removeAttr("disabled");
			},"json");
		} else {        
			if (ENV == 'dev') {
				alert('You must enter a username and password');
			} else {
				navigator.notification.alert("You must enter a username and password", function() {});
			}
			$("#btnLogin").removeAttr("disabled");
		}
		return false;
	}

	function handleLogout() {
		console.log('handleLogout');	
		
		$.getJSON(API+"/account/logout", function(res) {
			if (res.success) {
				window.localStorage.clear();  
				window.sessionStorage.clear();		
				$.mobile.changePage("#pageLogin");
			}
		});
				
	}
	
	$(document).on('click', '.btn-logout', handleLogout);

	$(document).on('click', "#btnLogin", handleLogin);
	
	$(document).on('change', '#toggleswitchremotechat', function(e) {		
       var current_status = $(this).val();
       console.log('toggleswitchremotechat '+$(this).val());
	
	   //var url = 'http://textwc.local/user/changeOnlineStatus';
	   var url = API+"/account/onlinestatus";
       $.ajax({
              url : url,
              type: "POST",
              dataType : 'json',
              data:{user_id: user.user_id, action:'chatStatus', status:current_status},
              success :function(data){
              	//window.location.reload();
				console.log(data);
              },
              error:function(data){    
				console.log(data);			  
              } 
        });
		
	});
	
	/*
	$(document).on('submit', "#loginForm", function(event) {
		event.preventDefault();
		handleLogin();
	});
	*/
	
	/*
	function deviceReady() {  
		console.log('deviceReady');
		//$("#loginForm").on("submit",handleLogin);

	}
	*/
     
    //Insert code here
    $(document).on("pageinit", "#pageLogin", function(e) {
		//$("#pageLogin").on("pageinit", function(e) {
        checkPreAuth();
    });
  

  if (ENV == 'dev') {
	//deviceReady();

	//checkPreAuth();
  }
	
});

