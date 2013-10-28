
//var ENV = 'dev';
//var API = 'http://rmcapp.eoi.local';
var ENV = 'production';
var API = 'http://rmcapp.eoi.com';

var request_id = '';

var capturedPhoto = 0;
var uploadedPhoto = 0;
var vinPic;

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
		document.addEventListener('load', this.onLoad, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //checkConnection();
		populatedropdown("request_field_car_year");
        //app.receivedEvent('deviceready');
        // Do cool things here...
    },
	onLoad: function() {	
		populatedropdown("request_field_car_year");
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

 //function to  load year in drodown. Default selected year : Current Year
function populatedropdown(yearfield){
      var today=new Date()
      var yearfield=document.getElementById(yearfield)
      for (var i=0; i<31; i++)
        //Select Year
    var thisyear=today.getFullYear()
    for (var y=0; y<25; y++){
      yearfield.options[y]=new Option(thisyear, thisyear)
      thisyear-=1
    }
    yearfield.options[0]=new Option(today.getFullYear(), today.getFullYear(), true, true) //select today's year
}

		
function validPageInfo(){
      var fname = document.getElementById("request_field_firstname").value;
      var lname = document.getElementById("request_field_lastname").value;
      var phone = document.getElementById("request_field_phone").value;
      var email = document.getElementById("request_field_email").value;
      if (lname == '' || fname == '' || phone == '' || email == '') {  
		if (ENV == 'dev') {
			alert('Please enter required field');
		} else {	    
			navigator.notification.alert(
				'Please Enter Required Field',  // message
				alertDismissed,         // callback
				'Empty Field',            // title
				'Ok'                  // buttonName
			);
		}
		 
      } else {     
		  if(typeof(Storage)!=="undefined") {
			  localStorage.lname=lname;
			  localStorage.fname=fname;
			  localStorage.phone=phone;
			  localStorage.email=email;
			  //document.getElementById("result").innerHTML="Last name: " + localStorage.lastname;
		  } else {
				console.log("No DB found");
		  }
		  					  
		  var result = ValidateEmail(email);
		  
		  if (result) {
			// save db
			var formData = $("#form-addrequest").serialize();
            //alert(formData);
              $.ajax({
                    type: "POST",
                    url: API+"/ajax.php?m=addrequest&id="+request_id,
                    cache: false,
                    data: formData,                    
                    beforeSend: function() {
                        // This callback function will trigger before data is sent
                        $.mobile.showPageLoadingMsg(true); // This will show ajax spinner
                    },
                    complete: function() {
                        // This callback function will trigger on data sent/received complete
                        $.mobile.hidePageLoadingMsg(); // This will hide ajax spinner
                    },
                    success: function (result) {
                        //    resultObject.formSubmitionResult = result;
                        //                $.mobile.changePage("#second");
                        console.log(result);  					
						//window.location="#page4
						if (result.success) {
							request_id = result.request_id;
							localStorage.request_id = request_id;
							$.mobile.changePage("#page-details");
						}
                    },
                    error: function (request,error) {
                        // This callback function will trigger on unsuccessful action                
                        alert('Network error has occurred please try again!');
                    }
                });
		
		  }
      }
 }

 function validPageDetails(){
 /*
      var fname = document.getElementById("request_field_firstname").value;
      var lname = document.getElementById("request_field_lastname").value;
      var phone = document.getElementById("request_field_phone").value;
      var email = document.getElementById("request_field_email").value;
      if (lname == '' || fname == '' || phone == '' || email == '') {  
		if (ENV == 'dev') {
			alert('Please enter required field');
		} else {	    
			navigator.notification.alert(
				'Please Enter Required Field',  // message
				alertDismissed,         // callback
				'Empty Field',            // title
				'Ok'                  // buttonName
			);
		}
		 
      } else {     
		*/
		
			// save db
			var formData = $("#form-addrequest").serialize();
            //alert(formData);
              $.ajax({
                    type: "POST",
                    url: API+"/ajax.php?m=updaterequest&id="+request_id+"&step=2",
                    cache: false,
                    data: formData,                    
                    beforeSend: function() {
                        // This callback function will trigger before data is sent
                        $.mobile.showPageLoadingMsg(true); // This will show ajax spinner
                    },
                    complete: function() {
                        // This callback function will trigger on data sent/received complete
                        $.mobile.hidePageLoadingMsg(); // This will hide ajax spinner
                    },
                    success: function (result) {
                        //    resultObject.formSubmitionResult = result;
                        //                $.mobile.changePage("#second");
                        console.log(result);  
						
						//window.location="#page4
						if (result.success) {
							$.mobile.changePage("#page-damaged");
						}
                    },
                    error: function (request,error) {
                        // This callback function will trigger on unsuccessful action                
                        alert('Network error has occurred please try again!');
                    }
                });
		  
      //}
 }
 
 //function to call pagefive 
function validPageDamaged() {
	//alert(capturedPhoto+ ' '+uploadedPhoto);
    if(capturedPhoto < 2){
        navigator.notification.alert(
            'Take at least TWO snaps of Damaged Part',  // message
            alertDismissed,         // callback
            'Snap', // title
            'Ok'                  // buttonName
        );
	} else if (uploadedPhoto !== capturedPhoto) {
		navigator.notification.alert(
            'Please Wait until your data uploads!!',  // message
            alertDismissed,         // callback
           'Processing', // title
            'Ok'                  // buttonName
        );
	} else {
			var formData = '';
			$.ajax({
                    type: "POST",
                    url: API+"/ajax.php?m=updaterequest&id="+request_id+"&step=3",
                    cache: false,
                    data: formData,                    
                    beforeSend: function() {
                        // This callback function will trigger before data is sent
                        $.mobile.showPageLoadingMsg(true); // This will show ajax spinner
                    },
                    complete: function() {
                        // This callback function will trigger on data sent/received complete
                        $.mobile.hidePageLoadingMsg(); // This will hide ajax spinner
                    },
                    success: function (result) {
                        //    resultObject.formSubmitionResult = result;
                        //                $.mobile.changePage("#second");
                        console.log(result);  
						
						//window.location="#page4
						if (result.success) {
							$.mobile.changePage("#page-vin");
						}
                    },
                    error: function (request,error) {
                        // This callback function will trigger on unsuccessful action                
                        alert('Network error has occurred please try again!');
                    }
                });
				
		//window.location="#page5"

	}
//else if(upload !== 0){
//         navigator.notification.alert(
//             'Please Wait until your data uploads!!',  // message
//             alertDismissed,         // callback
//            'Processing', // title
//             'Ok'                  // buttonName
//         );
//       }else if(upload == 0 && takenpic == 0){

      
    //}

}

function validPageVin() {
//var vehiclepic = document.getElementById('vehicleVIN');
  if(vinPic == 1 ){
  /*
	var formData = '';
			$.ajax({
                    type: "POST",
                    url: API+"/ajax.php?m=updaterequest&id="+request_id+"&step=4",
                    cache: false,
                    data: formData,                    
                    beforeSend: function() {
                        // This callback function will trigger before data is sent
                        $.mobile.showPageLoadingMsg(true); // This will show ajax spinner
                    },
                    complete: function() {
                        // This callback function will trigger on data sent/received complete
                        $.mobile.hidePageLoadingMsg(); // This will hide ajax spinner
                    },
                    success: function (result) {
                        //    resultObject.formSubmitionResult = result;
                        //                $.mobile.changePage("#second");
                        console.log(result);  
						
						//window.location="#page4
						if (result.success) {
							$.mobile.changePage("#page-details");
						}
                    },
                    error: function (request,error) {
                        // This callback function will trigger on unsuccessful action                
                        alert('Network error has occurred please try again!');
                    }
                });
				*/
				
				var formData = $("#form-confirmrequest").serialize();
		
		
            //alert(formData);
			
              $.ajax({
                    type: "POST",
                    url: API+"/ajax.php?m=confirmrequest&id="+request_id,
                    cache: false,
                    data: formData,                    
                    beforeSend: function() {
                        // This callback function will trigger before data is sent
                        $.mobile.showPageLoadingMsg(true); // This will show ajax spinner
                    },
                    complete: function() {
                        // This callback function will trigger on data sent/received complete
                        $.mobile.hidePageLoadingMsg(); // This will hide ajax spinner
                    },
                    success: function (result) {
                        //    resultObject.formSubmitionResult = result;
                        //                $.mobile.changePage("#second");
                        console.log(result);  
						
                        //$("#page-addlocation").dialog('close');
                        //$('[data-role=dialog]').dialog( "close" );
						//window.location="#page4
						if (result.success) {
							$('#request_id').html(request_id);
							$.mobile.changePage("#page-completed");
						}
                    },
                    error: function (request,error) {
                        // This callback function will trigger on unsuccessful action                
                        alert('Network error has occurred please try again!');
                    }
                });
				
     //window.location = "#page-details";
	 
	 localStorage.clear();
  }
  else{
     navigator.notification.alert(
            'Take a Picture of Your VIN',  // message
            alertDismissed,         // callback
            'Vehicle Identification Number',            // title
            'Ok'                  // buttonName
        );

   }
}
	 
// A button will call this function
// To capture photo
function capturePhoto() {
    // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(uploadPhoto, onFail, { 
        quality: 25, destinationType: Camera.DestinationType.FILE_URI 
    });
}

function captureVIN(){
    navigator.camera.getPicture(onImageDataSuccess, onFail, { quality: 25,
    destinationType: Camera.DestinationType.FILE_URI, });
}


function onImageDataSuccess(imageURI) {
   if (!imageURI) {
            document.getElementById('camera_status').innerHTML = "Take picture or select picture from library first.";
            return;
    }
	
   var vehicleVIN = document.getElementById('vehicleVIN');
      vehicleVIN.src =  imageURI;
      if(imageURI.length != 0){
        vinPic = 1;
      }
	  
	 //If you wish to display image on your page in app
	displayPhoto(imageURI);	 
    
	//NProgress.start();
	
	// upload
    var options = new FileUploadOptions();
    options.fileKey = "file";
    // var userid = '123456';
    var imagefilename = request_id + '_vin_' + Number(new Date()) + ".jpg";
    //options.fileName = imageURI;
	//options.fileName = imagefilename;
	options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType = "image/jpeg"; 

    var params = new Object();
    params.imageURI = imageURI;
	params.imageFileName = imagefilename;
	params.seq = capturedPhoto;
	//params.id = request_id;
    //params.userid = sessionStorage.loginuserid;
    options.params = params;
    options.chunkedMode = false; //true;
    
    var ft = new FileTransfer();
    var url = encodeURI(API+"/upload.php?id="+request_id+"&nomimage="+imagefilename);
    ft.upload(imageURI, url, win, fail, options);  
     
    
      }



// A button will call this function
// To select image from gallery
function getPhoto(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(uploadPhoto, onFail, { quality: 25,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
    });
}

function removePhoto(seq) {
/*
	alert('remove '+seq);
 navigator.notification.confirm(
        'Are you sure to remove this picture?', // message
         onConfirm,            // callback to invoke with index of button pressed
        'Confirm',           // title
        'OK,Cancel'         // buttonLabels
    );
	*/
}

function uploadPhoto(imageURI) {
    if (!imageURI) {
            document.getElementById('camera_status').innerHTML = "Take picture or select picture from library first.";
            return;
    }
		
    //If you wish to display image on your page in app
	displayPhoto(imageURI);	 
    
	// upload
    var options = new FileUploadOptions();
    options.fileKey = "file";
    // var userid = '123456';
    var imagefilename = request_id + '_' + Number(new Date()) + ".jpg";
    //options.fileName = imageURI;
	//options.fileName = imagefilename;
	options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType = "image/jpeg"; 

    var params = new Object();
    params.imageURI = imageURI;
	params.imageFileName = imagefilename;
	params.seq = capturedPhoto;
	//params.id = request_id;
    //params.userid = sessionStorage.loginuserid;
    options.params = params;
    options.chunkedMode = false; //true;
    
    var ft = new FileTransfer();
    var url = encodeURI(API+"/upload.php?id="+request_id+"&nomimage="+imagefilename);
    ft.upload(imageURI, url, win, fail, options);
	//ft.upload(imageURI, url, win, fail, options, true);
}

function displayPhoto(imageURI) {

  if(capturedPhoto == 9 ){
    capturedPhoto = 0;
	$('#picture-demo').show();
  }

  capturedPhoto++;

	//alert(capturedPhoto);

	if(capturedPhoto >= 1 && capturedPhoto <= 8){
		if (capturedPhoto == 1) {
			$('#picture-demo').hide();
		}
		$("#pictures").prepend('<div style="display: inline;" data-controltype="image"><img style="width: 100%; height: %" src="'+imageURI+'" id="damagedpart'+capturedPhoto+'" border="1" onclick="removePhoto('+capturedPhoto+');"></div>');
		//var damagedpart1 = document.getElementById('damagedpart1');			 
		  //damagedpart1.src =  imageURI;
		  //damagedpart1.style.visibility = 'visible';
	}
	/*
	else if(capturedPhoto == 2){
	   var damagedpart2 = document.getElementById('damagedpart2');	 	
		  damagedpart2.src =  imageURI;
		  	  damagedpart2.style.visibility = 'visible';
	}
	else if(capturedPhoto == 3){
	   var damagedpart3 = document.getElementById('damagedpart3');	 
		  damagedpart3.src =  imageURI;  
		    damagedpart3.style.visibility = 'visible';
	}
	else if(capturedPhoto == 4){
	   var damagedpart4 = document.getElementById('damagedpart4');
		  damagedpart4.src =  imageURI; 
damagedpart4.style.visibility = 'visible';		  
	}
	else if(capturedPhoto == 5){
	   var damagedpart5 = document.getElementById('damagedpart5');
	 
		  damagedpart5.src =  imageURI;  
		  damagedpart5.style.visibility = 'visible';	
	}
	else if(capturedPhoto == 6){
	   var damagedpart6 = document.getElementById('damagedpart6');
	  
		  damagedpart6.src =  imageURI;
		  damagedpart6.style.visibility = 'visible';	
	}
	else if(capturedPhoto == 7){
	   var damagedpart7 = document.getElementById('damagedpart7');
		  damagedpart7.src =  imageURI;  
		  damagedpart7.style.visibility = 'visible';	
	}
	else if(capturedPhoto == 8){
	   var damagedpart8 = document.getElementById('damagedpart8');
	  
		  damagedpart8.src =  imageURI;  
		  damagedpart8.style.visibility = 'visible';	
	}
	*/
 
}

//Success callback
function win(r) {    
    playBeep();
    //vibrate();
    console.log("Image uploaded successfully!!"); 
	uploadedPhoto++;
    //alert(uploadedPhoto);
	
	//document.getElementById('damagedbtn').enabled = true;
	//NProgress.done(true);				
				
    //alert("Sent = " + r.bytesSent); 
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
}
//Failure callback
function fail(error) {
   alert("There was an error uploading image");
   
   switch (error.code) 
    {  
     case FileTransferError.FILE_NOT_FOUND_ERR: 
      alert("Photo file not found"); 
      break; 
     case FileTransferError.INVALID_URL_ERR: 
      alert("Bad Photo URL"); 
      break; 
     case FileTransferError.CONNECTION_ERR: 
      alert("Connection error"); 
      break; 
    } 

    console.log("An error has occurred: Code = " + error.code); 
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}
// Called if something bad happens.
// 
function onFail(message) {
    console.log('Failed because: ' + message);
	//var msg ='Impossible de lancer l\'appareil photo';        
    //navigator.notification.alert(msg, null, '');       
}

//alert dialog dismissed
        function alertDismissed() {
            // do something
        }

        function composeText(){
		
		var formData = $("#form-confirmrequest").serialize();
		
		
            //alert(formData);
			
              $.ajax({
                    type: "POST",
                    url: API+"/ajax.php?m=confirmrequest&id="+request_id,
                    cache: false,
                    data: formData,                    
                    beforeSend: function() {
                        // This callback function will trigger before data is sent
                        $.mobile.showPageLoadingMsg(true); // This will show ajax spinner
                    },
                    complete: function() {
                        // This callback function will trigger on data sent/received complete
                        $.mobile.hidePageLoadingMsg(); // This will hide ajax spinner
                    },
                    success: function (result) {
                        //    resultObject.formSubmitionResult = result;
                        //                $.mobile.changePage("#second");
                        console.log(result);  
						
                        //$("#page-addlocation").dialog('close');
                        //$('[data-role=dialog]').dialog( "close" );
						//window.location="#page4
						if (result.success) {
							
							$('#form-addrequest')[0].reset();
							$('#form-confirmrequest')[0].reset();						    
							$('#pictures').html('');
							$('#picture-demo').show();
							$('#vehicleVIN').attr('src','img/vinpic2.png');
						
							$('#request_id').html(request_id);
							$.mobile.changePage("#page-completed");
						}
                    },
                    error: function (request,error) {
                        // This callback function will trigger on unsuccessful action                
                        alert('Network error has occurred please try again!');
                    }
                });
				/*
var vehiclemileage = document.getElementById('vehiclemileage').value;
var vehiclemodel = document.getElementById('vehiclemodel').value;
var message1 = document.getElementById('message_body').value;
var vechicleyear = document.getElementById("yeardropdown");
var strUser = vechicleyear.options[vechicleyear.selectedIndex].value;
var vehiclemake = document.getElementById("vehiclemake");
var makevehicle = vehiclemake.options[vehiclemake.selectedIndex].value;

var deviceName = device.platform;
var devicemodel = device.model;

var dated, fnamed, phoned, emailed, link1, link2, link3, link4, link5, link6, link7, link8, link9;

 if(typeof(Storage)!=="undefined")
  {
  dated = localStorage.date;
  fnamed = localStorage.fname;
  phoned = localStorage.phone;
  emailed= localStorage.email;
  link1 = localStorage.response;
  link2 = localStorage.response1;
  link3 = localStorage.response2;
  link4 = localStorage.response3;
  link5 = localStorage.response4;
  link6 = localStorage.response5;
  link7 = localStorage.response6;
  link8 = localStorage.response7;
  link9 = localStorage.vin;
  }
  
  */
/*
var email = 'gthapa@alucio.com, letsplay9@gmail.com';
        var subject = 'Get Your Estimate';
        var body = "Model of Vehicle: " + vehiclemodel +"\n"+ "Make of Vehicle: " + strUser + "\n" + "Mileage of Vehicle: "+vehiclemileage + "\n" + "Estimate Date: " + dated +"\n" + "Client's First Name: " + fnamed + "\n" + "Client's Phone Number: " + phoned +"\n" + "Client's Email: " + emailed + "\n" + "Make of Vehicle: " + makevehicle +"\n"  + "Client's Message: " + message1 + "\n" +"Download URL of all images: " + link1 + "\n" +link2 + "\n" +link3 + "\n" +link4+ "\n" +link5+"\n" + link6+"\n" + link7+ "\n" +link8 + "\n" + link9;
        location.href = 'mailto:' + email
            + '?subject=' + encodeURIComponent(subject)
            + '&body=' + encodeURIComponent(body);
*/
            localStorage.clear();
            // navigator.app.exitApp();
}

 // Beep three times
    //
    function playBeep() {
        navigator.notification.beep(1);
    }

    // Vibrate for 2 seconds
    //
    function vibrate() {
        navigator.notification.vibrate(2000);
    }
    
    function checkConnection() {
		var networkState = navigator.connection.type;

		var states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.CELL]     = 'Cell generic connection';
		states[Connection.NONE]     = 'No network connection';

		alert('Connection type: ' + states[networkState]);
	}

	
//Email Validation in JavaScript
function ValidateEmail(inputText) {  
	var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;  
	if(inputText.match(mailformat)) {		
		return true;  
	} else {  
		alert("You have entered an invalid email address!");  
		//document.form1.text1.focus();  
		return false;  
	}  
} 

//alert dialog dismissed
function alertDismissed() {
    // do something
}