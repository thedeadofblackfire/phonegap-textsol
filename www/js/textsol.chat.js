
/* 
 Created by: Manish Gopal Singh
 
 Name: Chat Engine 1.0
 */

(function($) {

    $.extend({
        playSound: function() {
            return $("<embed src='" + arguments[0] + "' hidden='true' autostart='true' loop='false' class='playSound'>").appendTo('.play');
        }
    });

})(jQuery);


function select_tab_by_id(id)
{
    $(function() {
        $('#chat a[href="#' + id + '"]').tab('show');
    })
}
function new_message(id) {

    //if ($(".soundOff").hasClass('btn-success'))
        $.playSound(objChat.chat_sound_path);

    $(function() {
        //$('#chat a[href="#' + id + '"]').tab('show');
		$('#chat a[href="#' + id + '"]').tab('new_message');
    })
}

var auto_refresh;

$(document).ready(function() {

    $('#chat a').on('click', function(e) {
        e.preventDefault();
        $(this).tab('show');
    })   

    $(document).on('click', ".btnChatSendReply", function(e) {
		e.preventDefault();		
        var $this = $(this);
        var session_id = $(this).attr('data-session');
      
        var wrapper = $(".messageWrapper");
        var id = $(".messageWrapper p.message:last").attr('mid');
        //  var wrapper = $(".tab-content .active .messageWrapper");
        //var id = $(".tab-content .active .messageWrapper p.message:last").attr('mid');
        var textarea = $(this).siblings('textarea');
        var message = $.trim(textarea.val());
        
        console.log('sessionid='+session_id + ' message='+message+' mid='+id);
	
        $this.siblings('p.err').remove();

        if (message.length < 1)
        {
            textarea.addClass('bordererr');
            textarea.after('<p class="err">Please enter your message.</p>');
            return false;

        }
        $(this).html(' Wait... ');
        $(this).attr('disabled', 'disabled');

        $.ajax({
            url: API + "/chat/save_reply_message",
            type: "POST",
            data: {id: id, message: message, support: objChat.support_display_name, user_id: objUser.user_id, session_id: session_id},
            success: function(data) {
                // echo '<p class="reply"><b>' . objChat.support_display_name . '</b>: ' . $reply->reply . ' <span>' . change_date_format('h:i:s a', $reply->post_date) . '</span></p>';
                var str = '';                
                if (data.reply) {
                    str += '<p class="reply" rid="'+data.reply.id+'"><b>'+objChat.support_display_name+'</b>: '+data.reply.reply+' <span class="time">'+data.reply.post_date_format+'</span></p>';
                    $(".messageWrapper").append(str);
                }
                //$(".tab-content .active .messageWrapper").append(data);
                
                //var wrapper=$(".tab-content .active .messageWrapper");
                //var selector=$('#chat li.active a').attr('href');
                // session_id = selector && selector.replace(/#/, ''); //strip for ie7                  
                // select_tab_by_id(session_id);
                $this.removeAttr('disabled');
                $this.html('Send');
				// $this.val('Send');
                textarea.val('');
                textarea.removeClass('bordererr');
                wrapper.scrollTop = wrapper.animate({scrollTop: 10000});
            }
        })
        

    });

    /*
	$(document).on('click', ".chatBtn", function(e) {
    //$('.chatBtn').on('click', function(e) {
		e.preventDefault();		
        var $this = $(this);
        var wrapper = $(".tab-content .active .messageWrapper");
        var id = $(".tab-content .active .messageWrapper p.message:last").attr('mid');
        var textarea = $(this).siblings('textarea');
        var message = $.trim(textarea.val());

		var session_id = $('#chat li.active a').attr('href');
        session_id = session_id && session_id.replace(/#/, ''); //strip for ie7 
		
        $this.siblings('p.err').remove();

        if (message.length < 1)
        {
            textarea.addClass('bordererr');
            textarea.after('<p class="err">Please enter your message.</p>');
            return false;

        }
        $(this).html(' Wait... ');
		//$(this).val(' Wait... ');
        $(this).attr('disabled', 'disabled');

        $.ajax({
            url: API + "/chat/save_reply_message",
            type: "POST",
            data: {id: id, message: message, support: objChat.support_display_name, user_id: objUser.user_id, session_id: session_id},
            success: function(data) {
                $(".tab-content .active .messageWrapper").append(data);
                //var wrapper=$(".tab-content .active .messageWrapper");
                //var selector=$('#chat li.active a').attr('href');
                // session_id = selector && selector.replace(/#/, ''); //strip for ie7                  
                // select_tab_by_id(session_id);
                $this.removeAttr('disabled');
                $this.html('Send');
				// $this.val('Send');
                textarea.val('');
                textarea.removeClass('bordererr');
                wrapper.scrollTop = wrapper.animate({scrollTop: 10000});
            }
        })

    });
    */

    $('.sendEmail').on('click', function() {
        $('#emailModal').modal('show');
        var selector = $('#chat li.active a').attr('href');
        session_id = selector && selector.replace(/#/, ''); //strip for ie7   
        $('#session_id').val(session_id);

    });


    $('.btn_sendEmail').on('click', function() {
        var session_id = $('#session_id').val();
        var emailAdd = $('#toEmail').val();
        $('#toEmail').siblings('p.err').remove();
        if (!IsEmail(emailAdd))
        {
            $('#toEmail').addClass('bordererr');
            $('#toEmail').after('<p class="err">Invalid email address.</p>');
            return false
        }
        $(this).val(' Wait... ');
        $(this).attr('disabled', 'disabled');

        $.ajax({
            url: AjaxURL + "send_chat_transcript_to_email",
            type: "GET",
            data: {session_id: session_id, email: emailAdd, support: objChat.support_display_name, status: false},
            success: function(data) {
                $('.btn_sendEmail').remove();
                if (data == "OK")
                {
                    $('.modal-body').html('<div class="alert alert-success">Email has been sent.</div>');
                }
                else
                {
                    $('.modal-body').html(data);
                }
            }
        })

    });



	$(document).on('click', ".closeChat", function(e) {    
		e.preventDefault();	
    //$('.closeChat').on('click', function() {

        if (!confirm('Are you sure, want to close this chat session?'))
        {
            return false;
        }
        var $this = $(this);
        var session_id = $('#chat li.active a').attr('href');
        session_id = session_id && session_id.replace(/#/, ''); //strip for ie7 
        $this.html(' wait... ');
        $this.addClass('disabled');
        $.ajax({
            url: AjaxURL + "send_chat_transcript_to_email",
            type: "GET",
            data: {session_id: session_id, email: '', support: objChat.support_display_name, status: true},
            success: function(data) {
                if (data == 'OK')
                {
                    $this.addClass('btn-success disabled');
                    $this.removeClass('closeChat btn-danger');
                    $this.html('Chat Closed');
                    $('.tab-content .active .chatBtn').siblings('textarea').remove();
                    $('.tab-content .active .chatBtn').remove();
                }
                else
                {
                    $this.html('<i class="icon-remove"></i> Close Chat');
                    $this.removeClass('disabled');
                    alert('Something went wrong. Please try again later.');
                }

            }
        })
    });


    $('.soundOff').on('click', function() {


        var $this = $(this);
        var user_id = $this.attr('user_id');


        $.ajax({
            url: AjaxURL + "chat_sound",
            type: "POST",
            data: {user_id: user_id},
            success: function(data) {
                if (data == 'off')
                {
                    $this.addClass('btn-danger');
                    $this.removeClass('btn-success');
                    $this.html('Sound<i class="icon-remove"></i>');
                }
                else
                {
                    $this.addClass('btn-success');
                    $this.removeClass('btn-danger');
                    $this.html('Sound<i class="icon-ok"></i>');
                }


            }

        })
    });



})

function chat_start() 
{
 	console.log(objChat.session_id);
    if (objChat.session_id && objChat.session_id!="") {
        $('#chat a[href="#' + objChat.session_id + '"]').tab('show');         
    } else {
        $('#chat a:first').tab('show');      
    }
	
    
    auto_refresh = setInterval(function() {
        chat_update()
    }, 5000); // refresh every 5 seconds 
    
	
}

function chat_update()
{
    var wrapper = $(".tab-content .active .messageWrapper");
    var selector = $('#chat li.active a').attr('href');
    session_id = selector && selector.replace(/#/, ''); //strip for ie7   
    
    var current_session_id = $('#current_session_id').val();
    var last_message_id = $(".messageWrapper p.message:last").attr('mid');
    console.log(current_session_id+' mid='+last_message_id);
    /*
    $.ajax({
        //url: AjaxURL + 'update_chat',
		url: API+'/chat/update_chat',
        dataType: "json",
        type: 'POST',
        data: {session_id: session_id, user_id: objUser.user_id, mid: last_message_id},
        success: function(data) {

            if (data.user.session_id) {

                var find = $('#chat').find('a[href="#' + data.user.session_id + '"]');
                //console.log(find.length);
                if (find.length == 0)
                {
                    $('#chat').prepend('<li class="new_user"><a href="#' + data.user.session_id + '">' + data.user.name + '</a></li>');
                    $('.tab-content').prepend('<div class="tab-pane" id="' + data.user.session_id + '"><div class="plugins"> <a class="btn closeChat btn-danger"><i class="icon-remove"></i> Close Chat</a> <a class="btn btn-primary sendEmail"><i class="icon-envelope"></i> Send Email</a></div><div class="messageWrapper">' + data.user.name + '</div><div class="chatform"><textarea style="width:80%; height: 60px;" name="chatText" id="chatInput"></textarea><br/><input type="submit" value="Send" class="btn btn-primary chatBtn" /></div></div>');
                }

            }

            var newfind = $(".tab-content .active .messageWrapper p.message[mid='" + data.message.id + "']");
            //console.log(data.alert);
            if (data.alert != null)
            {
                $.each(data.alert, function(k, v) {
                    for (var i = 0; i < v.no; i++) {
                        new_message(v.session_id);
                    }
                })
            }

            if (newfind.length == 0)
            {
                $(".tab-content .active .messageWrapper").append(data.message.text);
                $('#chat li.active a span').fadeOut(700);
                setTimeout(function() {
                    $('#chat li.active a span').remove()
                }, 1500);
                wrapper.scrollTop = wrapper.animate({scrollTop: 10000});
            }

        }
    });
    */
}

/*
function chat_update()
{
    var wrapper = $(".tab-content .active .messageWrapper");
    var selector = $('#chat li.active a').attr('href');
    session_id = selector && selector.replace(/#/, ''); //strip for ie7   
    $.ajax({
        //url: AjaxURL + 'update_chat',
		url: API+'/chat/update_chat',
        dataType: "json",
        type: 'POST',
        data: {session_id: session_id, user_id: objUser.user_id},
        success: function(data) {

            if (data.user.session_id) {

                var find = $('#chat').find('a[href="#' + data.user.session_id + '"]');
                //console.log(find.length);
                if (find.length == 0)
                {
                    $('#chat').prepend('<li class="new_user"><a href="#' + data.user.session_id + '">' + data.user.name + '</a></li>');
                    $('.tab-content').prepend('<div class="tab-pane" id="' + data.user.session_id + '"><div class="plugins"> <a class="btn closeChat btn-danger"><i class="icon-remove"></i> Close Chat</a> <a class="btn btn-primary sendEmail"><i class="icon-envelope"></i> Send Email</a></div><div class="messageWrapper">' + data.user.name + '</div><div class="chatform"><textarea style="width:80%; height: 60px;" name="chatText" id="chatInput"></textarea><br/><input type="submit" value="Send" class="btn btn-primary chatBtn" /></div></div>');
                }

            }

            var newfind = $(".tab-content .active .messageWrapper p.message[mid='" + data.message.id + "']");
            //console.log(data.alert);
            if (data.alert != null)
            {
                $.each(data.alert, function(k, v) {
                    for (var i = 0; i < v.no; i++) {
                        new_message(v.session_id);
                    }
                })
            }

            if (newfind.length == 0)
            {
                $(".tab-content .active .messageWrapper").append(data.message.text);
                $('#chat li.active a span').fadeOut(700);
                setTimeout(function() {
                    $('#chat li.active a span').remove()
                }, 1500);
                wrapper.scrollTop = wrapper.animate({scrollTop: 10000});
            }

        }
    });
}
*/

function chat_view(id) {
    console.log('chat_view');
        
    //$target.children('.messageWrapper').html('Loading....')
	console.log('load_message '+id);
       var s_id=id.replace(/#/, '');
            $.ajax({
                url: API+"/chat/get_conversation_by_session",
                type: "post",
                data: {replyname: objChat.support_display_name, session_id: s_id, user_id: objUser.user_id},
                success: function(msg){                  
                   element.children('.messageWrapper').html(msg);
                     var wrapper=$(".tab-content .active .messageWrapper");
                    wrapper.scrollTop = wrapper.animate({scrollTop:10000});
                }
            });
            
}

function IsEmail(email) {
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}