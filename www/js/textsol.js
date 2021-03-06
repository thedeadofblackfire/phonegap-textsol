
//var BASE_URL = 'http://staging.textsol.com';
var BASE_URL = 'http://www.textsol.com';
var ENV = 'production';
var ENV_TARGET = 'phonegap'; // html5, phonegap
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
var isChatSession = false;
var current_session_id = '';

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
        document.addEventListener('deviceready', this.onDeviceReady, true);
        //document.addEventListener('deviceready', this.onDeviceReady, false);
       
        if (ENV == 'dev') {
            // get automatically user from session
            objUser = window.sessionStorage.getItem('user');
            if (objUser) {
                objUser = JSON.parse(objUser);	
                console.log('retrieved user: ', objUser);
                            
            } else {
                objUser = {};
            }                     
            
            checkPreAuth();
            
            $.mobile.transitionFallbacks.slideout = "none";
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
        
        ln.init();
        
        if (ENV == 'production') {
            objUser = window.sessionStorage.getItem('user');
            if (objUser) {
                objUser = JSON.parse(objUser);	
                console.log('retrieved user: ', objUser);
                            
            } else {
                objUser = {};
            }                     
            
            checkPreAuth();
            
            $.mobile.transitionFallbacks.slideout = "none";
        }
        // save device info the first time for mobile's ower (device uuid)
        // http://docs.phonegap.com/en/3.2.0/cordova_device_device.md.html#Device
        
        //push_onDeviceReady();
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

// --
// functions
// --
function formatDate(d) {
	var str = d.substr(11,8);
	if (parseInt(d.substr(11,2)) < 12) str += ' am';
	else str += ' pm';
	return str;
}

function formatDateLight(d) {
	return d.substr(11,5);
}
	
           
            //http://stackoverflow.com/questions/8163703/cross-domain-ajax-doesnt-send-x-requested-with-header
            /*
             $.ajaxSetup({
                //headers: {"X-Requested-With":"XMLHttpRequest"},
                crossDomain: false
            });
            */
            
jQuery(document).ready(function($){
		
        
    //Insert code here
    $(document).on('pageinit', '#pageLogin', function(e) {
    //$(document).on('pagebeforeshow', '#pageLogin', function(){  
		//$("#pageLogin").on("pageinit", function(e) {
        console.log('#pageLogin pageinit');
        checkPreAuth();
    });
    
	$(document).on('pagebeforeshow', '#pageChat', function(){  
		console.log('#pageChat pagebeforeshow');	
		
		loadChatInit();			
		
		isChatSession = false;
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
            
            if ( url.hash.search(regex) !== -1 ) {
                //console.log(url);
                
                // We're being asked to display the items for a specific category.
                // Call our internal method that builds the content for the category
                // on the fly based on our in-memory category data structure.               
                loadSession(url, data.options);

                // Make sure to tell changePage() we've handled this call so it doesn't have to do anything.
                e.preventDefault();
            }
        }
    });

    function loadSession(urlObj, options) {       
        var params = hashParams(urlObj.hash);
        //console.log(params);
        
        var sessionid = params['id'];
        if( !sessionid ) {
          //alert('Session not found!');
          mofChangePage('#pageChat');
          return
        };
        
        console.log('loadSession '+sessionid);
     
       // show loading icon
       $.mobile.loading('show');  
       
       $.ajax({
          url: API+"/chat/get_conversation_by_session",
          datatype: 'json',      
          type: "post",
          data: {replyname: objChat.support_display_name, session_id: sessionid, user_id: objUser.user_id},
          //datatype:'xml',
          success:function(res){                    
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
               $header.find( "h1" ).html( res.name );
               //$header.find( "h1" ).html( res.name+' #'+sessionid );
               
               var chapterHTML = '';
               /*
               $( verseNodeName , chapter).each(function(i) {
                  var vers = $(this);
                  chapterHTML += '<p><sup>'+ (i+1) +'</sup> '+ vers.text() +'</p>'
               });
               */
               //chapterHTML += res.html_visitor;
               //chapterHTML += res.html_conversation;
        
                 chapterHTML += generatePageSession(res);
                //var htmlUserConversation = templateChatUserConversation(res);
                //chapterHTML += htmlUserConversation;
                
                //$('#container_chat_userlist').html(htmlUserConversation);
                //$("chat_userlist").listview('refresh');
               
               // Get the content element for the page to set it
               $content = $page.children( ".ui-content" );
               $('#sessionContent').html(chapterHTML);
			   //$content.html(chapterHTML);
			   //alert($('#sessionContent').html());
               //alert(chapterHTML);
          
				       
               isChatSession = true;
               // flag unread 
               checkUnread(sessionid);
               
               options.dataUrl = urlObj.href;
               //options.changeHash = false;
               //console.log(options);     

               $.mobile.loading('hide');               

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
        
        $.getJSON(API+"/account/notificationstatus?user_id="+objUser.user_id+"&operator_id="+objUser.operator_id, function(res) {
			console.log(res);
			var valeur = 'Off';
			if (res.status == '1') {
				valeur = 'On';
			}		
			$('#toggleswitchnotification').val(valeur).slider("refresh");
  
		});
		
    });
    
  	
	$(document).on('click', '.btn-logout', handleLogout);

	$(document).on('click', "#btnLogin", handleLoginForm);
	
	$(document).on('change', '#toggleswitchremotechat', function(e) {		
       var current_status = $(this).val();
       console.log('toggleswitchremotechat '+current_status);
	
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
    
    $(document).on('change', '#toggleswitchnotification', function(e) {		
       var current_status = $(this).val();
       console.log('toggleswitchnotification '+current_status);
	
	   var url = API+"/account/notificationstatus";
       $.ajax({
              url : url,
              type: "POST",
              dataType : 'json',
              data:{user_id: objUser.user_id, operator_id: objUser.operator_id, action:'notificationStatus', status:current_status},
              success :function(data){
				console.log(data);
              },
              error:function(data){    
				console.log(data);			  
              } 
        });
		
	});
    
    $(document).on('change', '#selectlanguage', function(e) {		
       var current_status = $(this).val();
       console.log('selectlanguage '+current_status);
       //alert(current_status);
       //displayLanguage();
       
         i18n.setLng(current_status, function(t)
                {
                    //handleRefreshOnlineUser(true);
                    $('body').i18n();
                });
       //lang.set(current_status);
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
     
  
	function loadChatInit() {
      console.log('loadChatInit');
      
      if (Object.keys(objChat).length == 0 ){
            console.log('Chat init & start');
            // save the online chat status
            
            /*
            var store = window.localStorage;
            var request = {
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: API+"/chat/init?user_id="+objUser.user_id,                
                //crossdomain: true,
                //xhrFields: {
                //  withCredentials: true
               //},
               
                headers: {
                    Cookie: store.getItem('session'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                complete: function (jqXHR, status){
                    if (status != 'success') {
                        console.log('ajax status: failure');
                    } else if (store.getItem('session') != null) {
                        console.log('ajax status: session exists');
                    } else {
                        console.log('ajax status: saving cookie');
                        var header = jqXHR.getAllResponseHeaders();
                        console.log( jqXHR.getResponseHeader("Set-Cookie"));
                        console.log(header);
                        var match = header.match(/(Set-Cookie|set-cookie): (.+?);/);
                        if (match) {
                            session = match[2];
                            store.setItem("session", session);
                        }
                    }
                },
                success: function(res) {
                    objChat = res;
                    //window.sessionStorage.setItem('objChat', JSON.stringify(objChat));
                    console.log(objChat);
          
                    //var context = {title: "My New Post", body: "This is my first post!"}
                    

                    handleRefreshOnlineUser();
                    
                    chat_start();
                },
            }
                   
            $.ajax(request);
            */
     
           
            //{"X-Requested-With":"XMLHttpRequest"}
            $.getJSON(API+"/chat/init?user_id="+objUser.user_id, function(res) {			
                objChat = res;
                //window.sessionStorage.setItem('objChat', JSON.stringify(objChat));
                console.log(objChat);
                
                //if (res.online_status == '1') {
                 //   online = true;
                //} else {
                //    online = false;
                    // @todo display offline message
                //}	
                
                //var context = {title: "My New Post", body: "This is my first post!"}
                
               
                //var htmlHeader = templateChatHeader(objChat);
                //var htmlLoop = templateChatLoop(objChat);
                //console.log(htmlLoop);
                //$('#chatHeader').html(htmlHeader);
                //$('.tab-content').html(htmlLoop);
                //$( "#left-panel" ).trigger( "updatelayout" );
                
                
                handleRefreshOnlineUser(false);
                
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
    
    
    /* 
     * mobile framework - Change Page
     * pageid = test.html or #changePage
     */
    function mofChangePage(pageid) {
        //$.mobile.changePage("some.html");				
        $.mobile.changePage(pageid);
    }
	
    function mofProcessBtn(id, state) {
        if (state) {
            $(id).addClass("ui-state-disabled");
            //$(id).html('processing...');
        } else {
            $(id).removeClass("ui-state-disabled");
        }
    }
    
	function checkPreAuth() {
		console.log('checkPreAuth');
		//var form = $("#loginForm");	
                            
		if(Object.keys(objUser).length == 0 && window.localStorage["username"] != undefined && window.localStorage["password"] != undefined) {
			//$("#username", form).val(window.localStorage["username"]);
			//$("#password", form).val(window.localStorage["password"]);
			handleLogin(window.localStorage["username"], window.localStorage["password"]);
		} 
        
        /*
        console.log('tot');
        if (objUser.country == 'FR') lang.set('fr');
        else if (objUser.country == 'MEX') lang.set('es');
        lang.initialize();
        */        
        
	}

    function handleLoginForm() {
		console.log('handleLoginForm');			
		var form = $("#loginForm");  	
		//disable the button so we can't resubmit while we wait
		//$("#submitButton",form).attr("disabled","disabled");
		//$("#btnLogin").attr("disabled","disabled");
		var u = $("#username", form).val();
		var p = $("#password", form).val();
        handleLogin(u,p);
    }
        
	function handleLogin(u,p) {
		console.log('handleLogin');		

        // show loading icon
       //$.mobile.showPageLoadingMsg(); 
       //$.mobile.loading( 'show' );
       //$.mobile.showPageLoadingMsg("b", "This is only a test", true);
   
        mofProcessBtn("#btnLogin", true);
		//var form = $("#loginForm");  	
		//disable the button so we can't resubmit while we wait
		//$("#submitButton",form).attr("disabled","disabled");
		//$("#btnLogin").attr("disabled","disabled");
		//var u = $("#username", form).val();
		//var p = $("#password", form).val();	
		if(u != '' && p!= '') {
            $.mobile.loading('show');
			$.post(API+"/account/login", {username:u,password:p}, function(res, textStatus, jqXHR) {
				console.log(res);
                //$.mobile.hidePageLoadingMsg();
				if(res.success == true) {
                    //http://stackoverflow.com/questions/5124300/where-cookie-is-managed-in-phonegap-app-with-jquery
                    //http://stackoverflow.com/questions/8358588/how-do-i-enable-third-party-cookies-under-phonegap-and-android-3-2
                    var header = jqXHR.getAllResponseHeaders();
                    var match = header.match(/(Set-Cookie|set-cookie): (.+?);/);
                    console.log(match);
                    if(match) {
                        my_saved_cookie = match[2];
                        console.log(my_saved_cookie);
                         window.localStorage.setItem("session",my_saved_cookie);
                    }
                        
					//store
					window.localStorage["username"] = u;
					window.localStorage["password"] = p; 			
					//window.sessionStorage["user_id"] = res.user.user_id; 
					window.sessionStorage.setItem('user', JSON.stringify(res.user));

				    objUser = res.user;
                    
                    /*
                    if (objUser.country == 'FR') lang.set('fr');
                    else if (objUser.country == 'MEX') lang.set('es');
                    lang.initialize();
                    */
        
                    // launch the push notification center because it's required objUser
                    push_onDeviceReady();
					
                    $.mobile.loading('hide');
					
                    mofProcessBtn("#btnLogin", false);
                    
                    mofChangePage('#pageChat');
				} else {	
					console.log(res.message);
					if (ENV == 'dev') {
						alert(res.message);
					} else {
						navigator.notification.alert(res.message, alertDismissed);
					}					
                    mofProcessBtn("#btnLogin", false);
			   }			
			},"json");
		} else {        
			if (ENV == 'dev') {
				alert('You must enter a username and password');
			} else {
				//navigator.notification.vibrate(1000);
				navigator.notification.alert("You must enter a username and password", alertDismissed);
			}
			mofProcessBtn("#btnLogin", false);
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
    
    function alertDismissed() {
        // do something
    } 
    
    function handleRefreshOnlineUser(loading) {
        console.log('handleRefreshOnlineUser');
        
        if (loading) {            
            $.getJSON(API+"/chat/online_user?user_id="+objUser.user_id, function(res) {			
                console.log(res);
                
                objChat.online_user = res.online_user;
                
                // bug here : clean badge, bad thing
                badgeChatCount = 0;
                displayBadgeChat();
                          
                // loop online users to display list of active chats
                loadDataUserList(objChat);
                
            });
        } else {       
            // loop online users to display list of active chats
            loadDataUserList(objChat);
        }
    }
    
function loadDataUserList(data) {
	//var htmlUserList = templateChatUserList(data);
    
    var htmlUserList = '';
    var title = i18n.t('description.nochatsinprogress'); //'You have no active chats'; //There are currently no chats in progress.
    if (data.online_user.length > 0) title = '<img src="img/infoico.png" style="position:relative">'+i18n.t('description.currentlyactivechats');
    
    //htmlUserList += '<div class="ui-bar ui-bar-e"><h3 style="display:inline-block; width:92%; margin-top:5px;">This is an alert message. </h3><div style="display:inline-block; width:8%; margin-top:0px; text-align:right;"><a href="#" data-role="button" data-icon="delete" data-inline="true" data-iconpos="notext" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="e" title="Dismiss" class="ui-btn ui-btn-up-e ui-shadow ui-btn-corner-all ui-btn-inline ui-btn-icon-notext"><span class="ui-btn-inner"><span class="ui-btn-text">Dismiss</span><span class="ui-icon ui-icon-delete ui-icon-shadow">&nbsp;</span></span></a></div><p style="font-size:85%; margin:-.3em 0 1em;">And here\'s some additional text in a paragraph.</p></div>';
    var focusChatStillAvailable = false;
                    
    htmlUserList += '<ul id="chat_userlist" data-role="listview" data-theme="d" data-divider-theme="d" data-count-theme="a">';
    htmlUserList += '<li data-role="list-divider" id="activechat_title">'+title+'</li>';
    $.each(data.online_user, function(k, v) {
        htmlUserList += generateLineUser(v,false);     
           
        if (current_session_id != '' && v.session_id == current_session_id) {
            focusChatStillAvailable = true;
        } 
            
    });
    htmlUserList += '</ul>';
    
	$('#container_chat_userlist').html(htmlUserList);
	
    $("#listview-content").trigger('create');  
    
    // check if current chat session need to be close (visitor has closed the chat)
    if (isChatSession && !focusChatStillAvailable) {
        // we close chat
        console.log('force close chat by user #'+current_session_id);
        mofChangePage('#pageChat');
    }    
                
    //$("#container_chat_userlist ul").listview('refresh');
	//$("chat_userlist").listview('refresh');
					
    //var source   = $("#articles-template").html();
    //var template = Handlebars.compile(source);
    
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
	console.log('displayBadgeChat '+badgeChatCount);
    if (badgeChatCount > 0) $('.badge-chat').html(badgeChatCount).fadeIn();
    else $('.badge-chat').html('').fadeOut();
}

function addUnread(session_id) {
	console.log('addUnread '+session_id+' badgeChatCount='+badgeChatCount);
	current_session_id = $('#current_session_id').val();
	// don't display bubble if current session
	if (isChatSession && session_id == current_session_id) {
		// do nothing but play the incoming message sound
	} else {
		var sess = objSession[ session_id ]; 
        if (sess) {
            sess.unreadMessage += 1; 
            badgeChatCount += 1;
            displayBadgeChat();
            console.log(sess);
        }
	}
}

function checkUnread(session_id) {
    console.log('checkUnread '+session_id+' badgeChatCount='+badgeChatCount);
    var sess = objSession[ session_id ]; 
	//console.log(sess);
    if (sess && sess.unreadMessage > 0) {     
        console.log('checkUnread '+session_id);   
        badgeChatCount -= sess.unreadMessage; 
        sess.unreadMessage = 0;         
        displayBadgeChat();    
           
        removeNewUserTag(session_id);
        
        console.log(sess); 
    }
}

function removeNewUserTag(session_id) {
	 console.log('removeNewUserTag '+session_id);
     var find = $('#chat_userlist').find('a[href="#pageChatSession?id=' + session_id + '"]');
	 console.log(find);
	 if (find.length > 0) {	    
		find.parent('li').removeClass('new_user');
	 }        
}

function pictureBrowser(v) {
    var browser = '';    
    if (v.browser == 'Internet Explorer') browser = 'IE.png';
    else if (v.browser == 'Google Chrome') browser = 'Chrome.png';
    else if (v.browser == 'Mozilla Firefox') browser = 'Firefox.png';
    else if (v.browser == 'Apple Safari') browser = 'Safari.png';
    else if (v.browser == 'Netscape') browser = 'Netscape.png';
    else if (v.browser == 'Opera') browser = 'Opera.png';
    else if (v.browser == 'Maxthon') browser = 'Maxthon.png';
    else browser = 'TheWorld.png';
    return browser;
}

function generateLineUser(v, newuser) {
    //htmlUserList += '<li data-icon="false"><a href="#pageChatSession?id='+v.session_id+'" sid="'+v.session_id+'" data-theme="e">'+v.name+'<p>CA</p> <p class="ui-li-aside"><strong>'+formatDate(v.start_date)+'</strong></p> <span class="ui-li-count">'+(parseInt(v.totalmsg) + parseInt(v.totalreply))+'</span></a></li>';
    
    // state http://www.iconarchive.com/show/american-states-icons-by-custom-icon-design.html    
 
    var browser = '';
	//browser = pictureBrowser(v);        
    //if (browser != '') browser = '<img src="img/browser/64/'+browser+'" alt="'+v.browser+'">';
    	
    var lg = '<img src="img/country/us.png" alt="United States" class="ui-li-icon">';
     
    var info = lg;
    if (v.city && v.city != '') info += ' '+v.city;
    if (v.region && v.region != '') info += ', '+v.region;
    //if (v.country && v.country != '' && v.country != 'Reserved' ) info += ' '+v.country;
    
    var str = '<li data-icon="false"';   
    if (newuser) str += 'class="new_user"';    
    //str += '><a href="#pageChatSession?id=' + v.session_id + '" sid="'+v.session_id+'" data-theme="e">' + lg + '<h2>' +v.name + '</h2><p>started at <strong>'+formatDate(v.start_date)+'</strong></p> <span class="ui-li-count">'+(parseInt(v.totalmsg) + parseInt(v.totalreply))+'</span></a></li>';
    str += '><a href="#pageChatSession?id=' + v.session_id + '" sid="'+v.session_id+'" data-theme="a">' + browser + '<h3>' + v.name + '</h3><p>'+info+'</p> <p class="ui-li-aside"><small>'+formatDate(v.start_date)+'</small></p> <span class="ui-li-count">'+(parseInt(v.totalmsg) + parseInt(v.totalreply))+'</span></a></li>';
    
    //str += '><a href="#pageChatSession?id=' + v.session_id + '" sid="'+v.session_id+'" data-theme="e">' + lg + v.name + ' <p class="ui-li-aside">started at <strong>'+formatDate(v.start_date)+'</strong></p> <span class="ui-li-count">'+(parseInt(v.totalmsg) + parseInt(v.totalreply))+'</span></a></li>';
        
    updateSession(v); 
    
    return str;
}

function generateDetailVisitor(data) {
    console.log('generateDetailVisitor');
    var str = '';
    
    str += '<div class="ui-panel-inner user_infox both_shadowx">';
    str += '<h3>'+i18n.t('label.details')+'</h3>';
    str += '<p>';
    //str += '<strong>User Info:</strong>&nbsp;&nbsp;';
    //if (data.visitor.email != '' || data.visitor.email != '0') str += '&nbsp;&nbsp;<b>Email:</b> '+data.visitor.email;
    //if (data.visitor.phone != '' || data.visitor.phone != '0') str += '&nbsp;&nbsp;<b>Phone:</b> '+data.visitor.phone;
    if (data.visitor.ip != '') str += '<br><b>'+i18n.t('label.ip')+':</b> '+data.visitor.ip;
    if (data.visitor.country != '') str += '<br><b>'+i18n.t('label.country')+':</b> '+data.visitor.country;   
    if (data.visitor.city != '') str += '<br><b>'+i18n.t('label.city')+':</b> '+data.visitor.city;
    if (data.visitor.region != '') str += '<br><b>'+i18n.t('label.region')+':</b> '+data.visitor.region;
    if (data.visitor.platform != '') str += '<br><b>'+i18n.t('label.platform')+':</b> '+data.visitor.platform;
    if (data.visitor.browser != '') str += '<br><b>'+i18n.t('label.browser')+':</b> '+data.visitor.browser;
    if (data.visitor.referrer != '') str += '<br><b>'+i18n.t('label.url')+':</b> '+data.visitor.referrer;       
    if (data.visitor.visit != '') str += '<br><b>'+i18n.t('label.visittime')+':</b> '+data.visitor.visit;
        
    str += '</p>';
    str += '<a href="#" data-rel="close" data-theme="d" class="ui-btn ui-btn-d ui-mini ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-left ui-btn-inline theme">'+i18n.t('label.closepanel')+'</a>';
    
    str += '</div>';
      
    
    $('#panelvisitor').html(str);
    //$( "#panelvisitor" ).trigger( "updatelayout" );
    
    return str;
}

function generatePageSession(data) {
    console.log('generatePageSession');
    var displayChatClose = false;
    var str = '';
       
    str += '<div class="zone_session2" id="'+data.session_id+'">';
    //str += generateDetailVisitor(data);
    generateDetailVisitor(data);
    
    str += '<div class="plugins">';    
    
    str += '<a href="#panelvisitor" class="btn btn-primary" style="width:auto!important;color:white;"><i class="icon-info-sign"></i> '+i18n.t('label.details')+'</a>&nbsp;&nbsp;';
     
    if (displayChatClose) {
		str += '<a class="btn btn-success disabled">'+i18n.t('label.chatclosed')+'</a>';		
	} else {
		str += '<a class="btn closeChat btn-danger" style="width:auto!important;color:white;"><i class="icon-remove"></i> '+i18n.t('label.closechat')+'</a>';		
	}      

   
    //str += '<a href="#panelvisitor" class="ui-btn ui-mini">Anchor</a>';   
    //str += '<a href="#panelvisitor" class="ui-btn ui-shadow ui-corner-all ui-btn-inline ui-btn-icon-left ui-icon-bars">Default panel</a>';
    
    //str += ' <a class="btn sendEmail btn-primary" style="width:auto!important;"><i class="icon-envelope"></i> Send Email</a>';
    str += '</div>';
    
    str += '<input type="hidden" name="current_session_id" id="current_session_id" value="'+data.session_id+'" />';
    
    current_session_id = data.session_id;
    
    str += '<ul class="messageWrapper chat-messages">';
    if (data.conversation != null) {
        $.each(data.conversation, function(k, v) {        
            str += updateSessionMessage(v.message, false);			
            if (v.reply != null) {
                $.each(v.reply, function(i, r) {
                    str += updateSessionReply(r, false);
                }); 
            }
        });
    }
    str += '</ul>';
    
	/*
	str += '<div class="messageWrapper chat">';
    if (data.conversation != null) {
        $.each(data.conversation, function(k, v) {        
            str += updateSessionMessage(v.message, false);			
            if (v.reply != null) {
                $.each(v.reply, function(i, r) {
                    str += updateSessionReply(r, false);
                }); 
            }
        });
    }
    str += '</div>';
	
    str += '<div class="chatform">';
    str += '<textarea data-session="'+data.session_id+'" style="width:98%; height: 60px;" name="chatText" id="chatInput" placeholder="Reply here..."></textarea>';
    str += '<a data-role="button" href="#" data-session="'+data.session_id+'" class="btn btn-primary btnChatSendReply">Send</a>';
    str += '</div>';
	*/
	
	str += '<div class="chat-footer chatform">';
    str += '<input type="text" data-session="'+data.session_id+'" name="chatText" id="chatInput" class="input-light input-large brad chat-search" placeholder="'+i18n.t('label.pressenter')+'">';
    //str += '<a data-role="button" href="#" data-session="'+data.session_id+'" class="btn btn-primary btnChatSendReply">'+i18n.t('label.send')+'</a>';
    str += '<a href="#" data-session="'+data.session_id+'" class="ui-btn ui-icon-arrow-r ui-btn-icon-right ui-shadow ui-corner-all btnChatSendReply" data-i18n="label.send">'+i18n.t('label.send')+'</a>';  
    str += '</div>';				
        
    str += '</div>';
    
    return str;
}

function updateDataUserList(v) {
	console.log('updateDataUserList');
    var str = generateLineUser(v,true);    
    $('#chat_userlist > li:first').after(str);
    $('#chat_userlist li:first').html(i18n.t('description.currentlyactivechats')); 
    //$('#chat_userlist').prepend(str);
	$("#chat_userlist").listview('refresh');

    // play incoming chat
    play_audio(objChat.chat_sound_path_local_incomingchat);      
}     

function updateSessionMessage(v, toAppend) {
    //var str = '<p class="message tmessage" mid="'+v.id+'"><b>'+v.name+'</b>: '+v.message+' <span class="time">'+formatDate(v.post_date)+'</span></p>';
    //var str = '<div class="message bubble_me me" mid="'+v.id+'"><span class="tail">&nbsp;</span>'+v.message+'<time datetime="'+v.post_date+'">'+v.name+' • '+formatDate(v.post_date)+'</time></div>';
    
	//var str = '<div class="message bubble_me me" mid="'+v.id+'"><span class="tail">&nbsp;</span>'+v.message+'<time datetime="'+v.post_date+'">'+formatDateLight(v.post_date)+'</time></div>';
    
	var str = '<li class="message right" mid="'+v.id+'"><div class="message_text">'+v.message+'<time datetime="'+v.post_date+'">'+formatDateLight(v.post_date)+'</time></div></li>';         
	//var str = '<li class="message right" mid="'+v.id+'"><img src="img/placeholders/avatars/2.jpg" class="img-circle"><div class="message_text">'+v.message+'<time datetime="'+v.post_date+'">'+formatDateLight(v.post_date)+'</time></div></li>';         
			
	if (toAppend) $(".messageWrapper").append(str);
    else return str;
}  

function updateSessionReply(v, toAppend) {
    //var str = '<p class="reply treply" rid="'+v.id+'"><b>'+objChat.support_display_name+'</b>: '+v.reply+' <span class="time">'+formatDate(v.post_date)+'</span></p>';
    
    //var str = '<div class="reply bubble_you you" rid="'+v.id+'"><span class="tail2">&nbsp;</span>'+v.reply+'<time datetime="'+v.post_date+'">'+formatDateLight(v.post_date)+'</time></div>';
    var str = '<li class="reply" rid="'+v.id+'"><div class="message_text">'+v.reply+'<time datetime="'+v.post_date+'">'+formatDateLight(v.post_date)+'</time></div></li>';         
	
    //var str = '<li class="reply" rid="'+v.id+'"><img src="img/placeholders/avatars/avatar.jpg" class="img-circle" width="26"><div class="message_text">'+v.reply+'<time datetime="'+v.post_date+'">'+formatDateLight(v.post_date)+'</time></div></li>';         
	    
    if (toAppend) $(".messageWrapper").append(str);	
    else return str;    
}      


function completeSessionReply(v) {
    console.log('complete '+v.processing_id);
    var newfind = $(".messageWrapper .reply[rid='"+v.processing_id+"']"); 
    if (newfind.length > 0) {
        console.log('complete '+v.processing_id+' changed');
        newfind.attr('rid', v.id);	  
    }
    // put a loader
}      

function generateProcessingId() {
    var d = new Date();
    return d.getMinutes()+''+d.getSeconds()+''+d.getMilliseconds();
}
// iso
function generateProcessingPostDate() {
    var d = new Date();
    return d.toISOString();
}
