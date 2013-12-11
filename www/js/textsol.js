
var BASE_URL = 'http://www.textsol.com';
var ENV = 'production';
if (window.location.hostname == 'livechat.phonegap.local') {
    BASE_URL = 'http://textwc.local';
    ENV = 'dev';
}
var API = BASE_URL+'/api';
var AjaxURL = BASE_URL+'/chat/';

var objUser = {};
var objChat = {};
var objSession = {}; // notification
var badgeChatCount = 0;
var audioEnable = true;

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

// --
// templates
// --
var sourceUserList = $("#chat-template-userlist").html();
var templateChatUserList = Handlebars.compile(sourceUserList);
        
var sourceUserConversation = $("#chat-template-userconversation").html();
var templateChatUserConversation = Handlebars.compile(sourceUserConversation);
		
//var sourceHeader = $("#chat-template-header").html();
//var templateChatHeader = Handlebars.compile(sourceHeader);
		
//var sourceLoop = $("#chat-template-loop").html();
//var templateChatLoop = Handlebars.compile(sourceLoop);

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
		
Handlebars.registerHelper('formatDate', function(v) {			
	return formatDate(v); 		
});
  
  
/*
function init() {
   document.addEventListener("deviceready", deviceReady, true);
   delete init;
}
*/

// --
// functions
// --
function formatDate(d) {
	var str = d.substr(11,8);
	if (parseInt(d.substr(11,2)) < 12) str += ' am';
	else str += ' pm';
	return str;
}
	
jQuery(document).ready(function($){
		
	$(document).on('pagebeforeshow', '#pageChat', function(){  
		console.log('#pageChat pagebeforeshow');	
		
		loadChatInit();			
		
    });
    

//http://www.moretechtips.net/2012/07/dynamic-page-generation-in-jquery.html
//http://jquerymobile.com/demos/1.0rc1/docs/pages/page-dynamic.html

    // Listen for any attempts to call changePage().    
    $(document).bind( "pagebeforechange", function( e, data ) {

        // We only want to handle changePage() calls where the caller is
        // asking us to load a page by URL.
        if ( typeof data.toPage === "string" ) {

            // We are being asked to load a page by URL, but we only
            // want to handle URLs that request the data for a specific
            // category.
            var url = $.mobile.path.parseUrl( data.toPage ),
                regex = /^#pageChatSession/;

            //console.log(url);
            
            if ( url.hash.search(regex) !== -1 ) {

                // We're being asked to display the items for a specific category.
                // Call our internal method that builds the content for the category
                // on the fly based on our in-memory category data structure.               
                loadSession(url, data.options);

                // Make sure to tell changePage() we've handled this call so it doesn't have to do anything.
                e.preventDefault();
            }
        }
    });

    // parse params in hash
	function hashParams(hash) {
		var ret = {};
	    var match;
	    var plus   = /\+/g;
	    var search = /([^\?&=]+)=([^&]*)/g;
	    var decode = function(s) { 
	    	return decodeURIComponent(s.replace(plus, " ")); 
	    };
	    while( match = search.exec(hash) ) ret[decode(match[1])] = decode(match[2]);
	    
	    return ret
	};
    

 

function loadSession(urlObj, options) {
   console.log('loadSession');
 
    var params = hashParams(urlObj.hash);
    //console.log(params);
    
    var sessionid = params['id'];
    if( !sessionid ) {
      //alert('Session not found!');
	  mofChangePage('#pageChat');
      return
    };

   // show loading icon
   $.mobile.showPageLoadingMsg();   
   
   $.ajax({
      url: API+"/chat/get_conversation_by_session",
      datatype: 'json',      
      type: "post",
      data: {replyname: objChat.support_display_name, session_id: sessionid, user_id: objUser.user_id},
      //datatype:'xml',
      success:function(res){
         $.mobile.hidePageLoadingMsg();
         console.log(res);
         //console.log(urlObj);
     
         // save xml document as a property of the array element
         /*               
         if( !objSession[ '_' + sessionid ] ) {
            objSession[ '_' + sessionid ] = {};
		
		  };
         var book = objSession[ '_' + sessionid ];
         book['text'] = res;
         //book.text = res;        
         console.log(objSession);
         */
            
         // Get the empty page we are going to insert our content into.
            var pageSelector = urlObj.hash.replace( /\?.*$/, "" );
           //var $page = $('#pageChatSession');
           var $page = $( pageSelector );
          
           // Get the header for the page to set it
           $header = $page.children( ":jqmData(role=header)" );
           $header.find( "h1" ).html( res.name+' #'+sessionid );
           //$header.find( "h1" ).html( book.bname +' '+ chapterNum );

           var chapterHTML = '';
           /*
           $( verseNodeName , chapter).each(function(i) {
              var vers = $(this);
              chapterHTML += '<p><sup>'+ (i+1) +'</sup> '+ vers.text() +'</p>'
           });
           */
           chapterHTML += res.html_visitor;
           //chapterHTML += res.html_conversation;
    
           	var htmlUserConversation = templateChatUserConversation(res);
            chapterHTML += htmlUserConversation;
			//$('#container_chat_userlist').html(htmlUserConversation);
			//$("chat_userlist").listview('refresh');
           
           // Get the content element for the page to set it
           $content = $page.children( ":jqmData(role=content)" );
           $content.html(chapterHTML);
                   
           // flag unread 
           checkUnread(sessionid);
           
           options.dataUrl = urlObj.href;
           //options.changeHash = false;
           //console.log(options);                      

           // switch to the page we just modified.
           $.mobile.changePage( $page, options );
   
      },
      error: function(jqXHR, textStatus, errorThrown) {
         alert('Error loading session, try again!');
      }
   });
   
};
    


/*
    $(document).on('pagebeforeshow', '#pageChatView', function(){  
		console.log('#pageChatView pagebeforeshow');	
		console.log(location.hash);
        console.log(window.location.href );
        console.log($.mobile.urlHistory.getActive().url);
         var u = $.mobile.path.parseUrl( window.location.href ),
                re = /^#pageChatView/;
var currentUrl = $.mobile.activePage.data('url');
                console.log(u);
                //alert(currentUrl);
        //console.log(this.attr( "href" ));
		// save the online chat status
      
		
    });
    */
	
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
      
      if (Object.keys(objChat).length == 0 ){
            console.log('Chat init & start');
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
                
                /*
                var htmlHeader = templateChatHeader(objChat);
                var htmlLoop = templateChatLoop(objChat);
                //console.log(htmlLoop);
                $('#chatHeader').html(htmlHeader);
                $('.tab-content').html(htmlLoop);
                //$( "#left-panel" ).trigger( "updatelayout" );
                */
                
                handleRefreshOnlineUser();
                
                chat_start();
                
            });
        }
        
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
        loadDataUserList(objChat);
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
       
        
  if (ENV == 'dev') {
	//deviceReady();

	//checkPreAuth();
  }
  
	
});

function loadDataUserList(data) {
	//var htmlUserList = templateChatUserList(data);
    
    var htmlUserList = '';
    
    htmlUserList += '<ul id="chat_userlist" data-role="listview" data-inset="true" data-theme="d" data-divider-theme="e" data-count-theme="c">';
    htmlUserList += '<li data-role="list-divider">Below are your currently active chats</li>';
    $.each(data.online_user, function(k, v) {                
        htmlUserList += '<li><a href="#pageChatSession?id='+v.session_id+'" sid="'+v.session_id+'" data-theme="e">'+v.name+'<p>CA</p> <p class="ui-li-aside"><strong>'+formatDate(v.start_date)+'</strong></p> <span class="ui-li-count">'+(parseInt(v.totalmsg) + parseInt(v.totalreply))+'</span></a></li>';
    
        updateSession(v); 
        
    });
    htmlUserList += '</ul>';
    
	$('#container_chat_userlist').html(htmlUserList);
	//$("#container_chat_userlist ul").listview('refresh');
	//$("chat_userlist").listview('refresh');
					
    //var source   = $("#articles-template").html();
    //var template = Handlebars.compile(source);
	
    $("#listview-content").trigger('create');  
     // $("#pageChat").trigger('pagecreate');
      //$("#chat_userlist ul").listview('refresh');
      //$("#chat_userlist ul").listview().listview('refresh');
      
}

function updateSession(v) {
    if( !objSession[ v.session_id ] ) {
        console.log('updateUser new='+v.session_id);
        v.unreadMessage = 0;
        objSession[ v.session_id ] = v; //{}
    } else {
        // update
        console.log('updateUser update='+v.session_id);
          
        var sess = objSession[ v.session_id ];     
        sess.end_date = v.end_date;
        var newIncomingMessage = parseInt(v.totalmsg) - parseInt(sess.totalmsg);
        sess.unreadMessage = sess.unreadMessage + newIncomingMessage;
        
        badgeChatCount += newIncomingMessage;
        displayBadgeChat();

        console.log(sess); 
    }
        
}

function displayBadgeChat() {
    if (badgeChatCount > 0) $('.badge-chat').html(badgeChatCount).fadeIn();
    else $('.badge-chat').html('').fadeOut();
}

function checkUnread(session_id) {
    var sess = objSession[ session_id ]; 
    if (sess.unreadMessage > 0) {     
        console.log('checkUnread '+session_id);   
        badgeChatCount -= sess.unreadMessage; 
        sess.unreadMessage = 0;         
        displayBadgeChat();    
           
        removeNewUserTag(session_id);
        
        console.log(sess); 
    }
}

function removeNewUserTag(session_id) {
     var find = $('#chat_userlist').find('a[href="#pageChatSession?id=' + session_id + '"]');
     find.parent('li').removeClass('new_user');
        
}

function updateDataUserList(v) {
    $('#chat_userlist > li:first').after('<li class="new_user"><a href="#pageChatSession?id=' + v.session_id + '" sid="'+v.session_id+'" data-theme="e">' + v.name + '<p>CA</p> <p class="ui-li-aside"><strong>'+formatDate(v.start_date)+'</strong></p><span class="ui-li-count">'+(parseInt(v.totalmsg) + parseInt(v.totalreply))+'</span></a></li>');
    //$('#chat_userlist').prepend('<li class="new_user"><a href="#pageChatSession?id=' + v.session_id + '" sid="'+v.session_id+'" data-theme="e">' + v.name + '<p>CA</p> <p class="ui-li-aside"><strong>'+formatDate(v.start_date)+'</strong></p><span class="ui-li-count">'+(parseInt(v.totalmsg) + parseInt(v.totalreply))+'</span></a></li>');
	$("#chat_userlist").listview('refresh');

    updateSession(v);     
    
    // play incoming chat
    play_audio(objChat.chat_sound_path_local_incomingchat);
      
}     

function updateSessionMessage(v) {
    var str = '<p class="message" mid="'+v.id+'"><b>'+v.name+'</b>: '+v.message+' <span class="time">'+formatDate(v.post_date)+'</span></p>';
	$(".messageWrapper").append(str);		
}  

function updateSessionReply(v) {
    var str = '<p class="reply" rid="'+v.id+'"><b>'+objChat.support_display_name+'</b>: '+v.reply+' <span class="time">'+formatDate(v.post_date)+'</span></p>';
	$(".messageWrapper").append(str);			
}      
