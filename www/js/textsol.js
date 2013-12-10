
var BASE_URL = 'http://www.textsol.com';
var ENV = 'production';
if (window.location.hostname == 'livechat.phonegap.local') {
    BASE_URL = 'http://wctext.local';
    ENV = 'dev';
}
var API = BASE_URL+'/api';
var AjaxURL = BASE_URL+'/chat/';

var objUser = {};
var objChat = {};
var objSession = {};

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
    
    // Bind to the click of the example link
    /*
    $(document).on('click', '.goview', function( event ) {

  // Append #bar
  alert('goview');
  mofChangePage('#pageChatView');
  
  $.mobile.navigate( "#bar", {
    info: "info about the #bar hash"
  });

  // Replace #bar with #baz
  $.mobile.navigate( "#baz" );

  // Log the results of the navigate event
  $( window ).on( "navigate", function( event, data ){
    console.log( data.state.info );
    console.log( data.state.direction );
    console.log( data.state.url );
    console.log( data.state.hash );
  });

  // Go back to pop the state for #bar and log it
  window.history.back();
});
*/

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

                console.log(url);
            if ( url.hash.search(regex) !== -1 ) {

                // We're being asked to display the items for a specific category.
                // Call our internal method that builds the content for the category
                // on the fly based on our in-memory category data structure.
                showSession( url, data.options );

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
    
    // load book xml by its short name
function loadSession(s_id, url, options) {
   // show loading icon
   $.mobile.showPageLoadingMsg();

   $.ajax({
      url: API+"/chat/get_conversation_by_session",
      datatype: 'text',
      type: "post",
      data: {replyname: objChat.support_display_name, session_id: s_id, user_id: objUser.user_id},
      //datatype:'xml',
      success:function(res){
         $.mobile.hidePageLoadingMsg();
         console.log(res);
     
         // save xml document as a property of the array element
                        
         if( !objSession[ '_' + s_id ] ) {
            objSession[ '_' + s_id ] = {};
		
		  };
         var book = objSession[ '_' + s_id ];
         book['text'] = res;
         //book.text = res;
        
         console.log(objSession);
         
         // call showSession 
         showSession( url, options );
      },
      error: function(jqXHR, textStatus, errorThrown) {
         alert('Error loading session, try again!');
      }
   });
   
};

    
// Load the data for a specific category, based on
// the URL passed in. Generate markup for the items in the
// category, inject it into an embedded page, and then make
// that page the current active page.
function showSession( urlObj, options ) {
    var params = hashParams(urlObj.hash);
    console.log(params);
    
	//var categoryName = urlObj.hash.replace( /.*id=/, "" ),
    var sessionid = params['id'];
    if( !sessionid ) {
      alert('Session not found!');
      return
    };
       
     var book = objSession[ '_' + sessionid ];
   // book xml was not loaded ?   
   if( !book || book['text']==undefined || !book['text'] ){
      // call loadBook first
      loadSession( sessionid, urlObj, options);
      return
   };
   

            
   // get chapter num
   //var chapterNum = parseInt( params['num'] );
   //if ( isNaN(chapterNum) || chapterNum<=0 ) chapterNum=1;


		// Get the object that represents the category we
		// are interested in. Note, that at this point we could
		// instead fire off an ajax request to fetch the data, but
		// for the purposes of this sample, it's already in memory.
		//category = categoryData[ categoryName ],

		// The pages we use to display our content are already in
		// the DOM. The id of the page we are going to write our
		// content into is specified in the hash before the '?'.
		var pageSelector = urlObj.hash.replace( /\?.*$/, "" );

   // Get the empty page we are going to insert our content into.
   //var $page = $('#chapter');
   var $page = $( pageSelector );
  
   // Get the header for the page to set it
   $header = $page.children( ":jqmData(role=header)" );
   $header.find( "h1" ).html( 'test' );
   //$header.find( "h1" ).html( book.bname +' '+ chapterNum );

   var chapterHTML = '';
   /*
   $( verseNodeName , chapter).each(function(i) {
      var vers = $(this);
      chapterHTML += '<p><sup>'+ (i+1) +'</sup> '+ vers.text() +'</p>'
   });
   */
   chapterHTML += '<p>bla bla bla bla session='+sessionid+'</p>';
   
   // Get the content element for the page to set it
   $content = $page.children( ":jqmData(role=content)" );
   $content.html(chapterHTML);

   // change href of next links to the next chapter
   //var nextChapterNum = chapterNum >= chaptersSize? chaptersSize : chapterNum+1;
   //$('a.next', $page).attr('href' , '#chapter?book='+ params['book'] + '&num='+ nextChapterNum );

   // update data-url that shows up in the browser location
   options.dataUrl = urlObj.href;
   console.log(options);

   // switch to the page we just modified.
   $.mobile.changePage( $page, options );
   
   /*
	if ( category ) {
		// Get the page we are going to dump our content into.
		var $page = $( pageSelector ),

			// Get the header for the page.
			$header = $page.children( ":jqmData(role=header)" ),

			// Get the content area element for the page.
			$content = $page.children( ":jqmData(role=content)" ),

			// The markup we are going to inject into the content
			// area of the page.
			markup = "<p>" + category.description + "</p><ul data-role='listview' data-inset='true'>",

			// The array of items for this category.
			cItems = category.items,

			// The number of items in the category.
			numItems = cItems.length;

		// Generate a list item for each item in the category
		// and add it to our markup.
		for ( var i = 0; i < numItems; i++ ) {
			markup += "<li>" + cItems[i].name + "</li>";
		}
		markup += "</ul>";

		// Find the h1 element in our header and inject the name of
		// the category into it.
		$header.find( "h1" ).html( category.name );

		// Inject the category items markup into the content element.
		$content.html( markup );

		// Pages are lazily enhanced. We call page() on the page
		// element to make sure it is always enhanced before we
		// attempt to enhance the listview markup we just injected.
		// Subsequent calls to page() are ignored since a page/widget
		// can only be enhanced once.
		$page.page();

		// Enhance the listview we just injected.
		$content.find( ":jqmData(role=listview)" ).listview();

		// We don't want the data-url of the page we just modified
		// to be the url that shows up in the browser's location field,
		// so set the dataUrl option to the URL for the category
		// we just loaded.
		options.dataUrl = urlObj.href;

		// Now call changePage() and tell it to switch to
		// the page we just modified.
		$.mobile.changePage( $page, options );
	}
    */
}



function showChapter( url, options ) {
   // parse params in url hash
   var params = hashParams(url.hash);

   // Get book by its short-name 
   var book = books[ '_' + params['book'] ];
   if( !book ) {
      alert('Book not found!');
      return
   };

   // book xml was not loaded ?
   if( book['xml']==undefined || !book['xml'] ){
      // call loadBook first
      loadBook( params['book'], url, options);
      return
   };

   // get chapter num
   var chapterNum = parseInt( params['num'] );
   if ( isNaN(chapterNum) || chapterNum<=0 ) chapterNum=1;

   // get chapters nodes in book, chapterNodeName='chapter' for OSIS XML
   var chapters = $( chapterNodeName , book['xml']);
   var chaptersSize = chapters.size();
   // Use last chapter if num is greater than chapters count
   if( chapterNum > chaptersSize ) chapterNum= chaptersSize;

   // get chapter
   var chapter = chapters.eq( chapterNum-1 );

   // append verses as paragraphs
   var chapterHTML = '';
   $( verseNodeName , chapter).each(function(i) {
      var vers = $(this);
      chapterHTML += '<p><sup>'+ (i+1) +'</sup> '+ vers.text() +'</p>'
   });

   // Get the empty page we are going to insert our content into.
   var $page = $('#chapter');
  
   // Get the header for the page to set it
   $header = $page.children( ":jqmData(role=header)" );
   $header.find( "h1" ).html( book.bname +' '+ chapterNum );

   // Get the content element for the page to set it
   $content = $page.children( ":jqmData(role=content)" );
   $content.html(chapterHTML);

   // change href of next links to the next chapter
   var nextChapterNum = chapterNum >= chaptersSize? chaptersSize : chapterNum+1;
   $('a.next', $page).attr('href' , '#chapter?book='+ params['book'] + '&num='+ nextChapterNum );

   // update data-url that shows up in the browser location
   options.dataUrl = url.href;

   // switch to the page we just modified.
   $.mobile.changePage( $page, options )
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

