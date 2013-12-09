
var ENV = 'dev';
//var ENV = 'production';
var BASE_URL = 'http://textwc.local';
//var BASE_URL = 'http://www.textsol.com';
var API = BASE_URL+'/api';
var AjaxURL = BASE_URL+'/chat/';

var objUser = {};
var objChat = {};

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
		objUser = window.sessionStorage.getItem('user');
		if (objUser) {
			objUser = JSON.parse(objUser);	
			console.log('retrieved user: ', objUser);
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
function init() {
   document.addEventListener("deviceready", deviceReady, true);
   delete init;
}
*/

jQuery(document).ready(function($){
	
		var sourceUserList = $("#chat-template-userlist").html();
		var templateChatUserList = Handlebars.compile(sourceUserList);
		
		var sourceHeader = $("#chat-template-header").html();
		var templateChatHeader = Handlebars.compile(sourceHeader);
		
		var sourceLoop = $("#chat-template-loop").html();
		var templateChatLoop = Handlebars.compile(sourceLoop);

		Handlebars.registerHelper('displayChatClose', function(object) {
			if (object == '1') {
				return new Handlebars.SafeString(
					'<a class="btn btn-success disabled">Chat Closed</a>'
				);
			} else {
				return new Handlebars.SafeString(
					'<a class="btn closeChat btn-danger" style="width:auto!important;"><i class="icon-remove"></i> Close Chat</a>'
				);
			}
		});
		
			Handlebars.registerHelper('displayTotal', function(msg,reply) {
			
				return (parseInt(msg) + parseInt(reply));
			
		});
		
		
	$(document).on('pagebeforeshow', '#pageChat', function(){  
		console.log('#pageChat pagebeforeshow');	
		
		loadChatInit();			
		
    });
	
    $(document).on('pagebeforeshow', '#pageSettings', function(){  
		console.log('#pageSettings pagebeforeshow');	
		
		// save the online chat status
		$.getJSON(API+"/account/onlinestatus?user_id="+objUser.user_id, function(res) {
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
			$('#toggleswitchremotechat').val(valeur).slider("refresh");
  
		});
		
    });
    
    function alertDismissed() {
        // do something
    } 
  
    /* 
     * mobile framework - Change Page
     * pageid = test.html or #changePage
     */
    function mofChangePage(pageid) {
        //$.mobile.changePage("some.html");				
        $.mobile.changePage(pageid);
    }
	
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

				    objUser = res.user;
					
                    mofChangePage('#pageChat');
				} else {	
					console.log(res.message);
					if (ENV == 'dev') {
						alert(res.message);
					} else {
						navigator.notification.alert(res.message, alertDismissed);
					}
					$("#btnLogin").removeAttr("disabled");
			   }
			 $("#btnLogin").removeAttr("disabled");
			},"json");
		} else {        
			if (ENV == 'dev') {
				alert('You must enter a username and password');
			} else {
				//navigator.notification.vibrate(1000);
				navigator.notification.alert("You must enter a username and password", alertDismissed);
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
                
                mofChangePage('#pageLogin');
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
              data:{user_id: objUser.user_id, action:'chatStatus', status:current_status},
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
  
	function loadChatInit() {
		console.log('loadChatInit');
	
		// save the online chat status
		$.getJSON(API+"/chat/init?user_id="+objUser.user_id, function(res) {			
			objChat = res;
			//window.sessionStorage.setItem('objChat', JSON.stringify(objChat));
			console.log(objChat);
			/*
			if (res.online_status == '1') {
				online = true;
			} else {
				online = false;
				// @todo display offline message
			}	
			*/
			//var context = {title: "My New Post", body: "This is my first post!"}
			
			var htmlHeader = templateChatHeader(objChat);
		    var htmlLoop = templateChatLoop(objChat);
			//console.log(htmlLoop);
			$('#chatHeader').html(htmlHeader);
			$('.tab-content').html(htmlLoop);
			//$( "#left-panel" ).trigger( "updatelayout" );
			
			handleRefreshOnlineUser();
			chat_start();
			
		});
        
        /*
		if(window.localStorage["username"] != undefined && window.localStorage["password"] != undefined) {
			$("#username", form).val(window.localStorage["username"]);
			$("#password", form).val(window.localStorage["password"]);
			handleLogin();
		}
        */
	}

    function handleRefreshOnlineUser() {
        console.log('handleRefreshOnlineUser');
        
        // loop online users to display list of active chats
        showDataUserList();
    }
  
  /*
  $(document).on('pagebeforeshow', '#listview-page', function(){
    parseRSS(); 
});

function parseRSS() {
      var articles = { entries: []};
      for (var i = 0; i <=4; i++)
      {
        var obj = {
          title: "test" + i
        };
        articles.entries.push(obj);
      }
      showData(articles);

}
*/
  function showDataUserList()
{
	var htmlUserList = templateChatUserList(objChat);
			$('#container_chat_userlist').html(htmlUserList);
			//$("#container_chat_userlist ul").listview('refresh');
			$("chat_userlist").listview('refresh');
			
			
 //var source   = $("#articles-template").html();
  //var template = Handlebars.compile(source);
	
  $("#listview-content").trigger('create');  
  $("#pageChat").trigger('pagecreate');
  $("#chat_userlist ul").listview('refresh');
  $("#chat_userlist ul").listview().listview('refresh');
 }
        
        
  if (ENV == 'dev') {
	//deviceReady();

	//checkPreAuth();
  }
  
	
});

