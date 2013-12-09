
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


    if ($(".soundOff").hasClass('btn-success'))
        $.playSound(audioFile);

    $(function() {
        $('#chat a[href="#' + id + '"]').tab('new_message');
    })
}


$(document).ready(function() {

    $('#chat a').live('click', function(e) {
        e.preventDefault();
        $(this).tab('show');
    })
    console.log(chatSelect);
    if (chatSelect && chatSelect!="") {
        $('#chat a[href="#' + chatSelect + '"]').tab('show');
         
    } else {
        $('#chat a:first').tab('show');
       
    }

    $('.chatBtn').live('click', function() {
        var $this = $(this);
        var wrapper = $(".tab-content .active .messageWrapper");
        var id = $(".tab-content .active .messageWrapper p.message:last").attr('mid');
        var textarea = $(this).siblings('textarea');
        var message = $.trim(textarea.val());

        $this.siblings('p.err').remove();

        if (message.length < 1)
        {
            textarea.addClass('bordererr');
            textarea.after('<p class="err">Please enter your message.</p>');
            return false;

        }
        $(this).val(' Wait... ');
        $(this).attr('disabled', 'disabled');

        $.ajax({
            url: AjaxURL + "save_reply_message",
            type: "POST",
            data: {id: id, message: message, support: SupportName},
            success: function(data) {
                $(".tab-content .active .messageWrapper").append(data);
                //var wrapper=$(".tab-content .active .messageWrapper");
                //var selector=$('#chat li.active a').attr('href');
                // session_id = selector && selector.replace(/#/, ''); //strip for ie7                  
                // select_tab_by_id(session_id);
                $this.removeAttr('disabled');
                $this.val('Send');
                textarea.val('');
                textarea.removeClass('bordererr');
                wrapper.scrollTop = wrapper.animate({scrollTop: 10000});
            }
        })



    });




    var auto_refresh = setInterval(function() {
        chat_update()
    }, 5000); // refresh every 2 seconds (before: 5 seconds 5000)


    $('.sendEmail').live('click', function() {
        $('#emailModal').modal('show');
        var selector = $('#chat li.active a').attr('href');
        session_id = selector && selector.replace(/#/, ''); //strip for ie7   
        $('#session_id').val(session_id);

    });


    $('.btn_sendEmail').click('click', function() {
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
            data: {session_id: session_id, email: emailAdd, support: SupportName, status: false},
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



    $('.closeChat').live('click', function() {

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
            data: {session_id: session_id, email: '', support: SupportName, status: true},
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


    $('.soundOff').live('click', function() {


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


function chat_update()
{
    var wrapper = $(".tab-content .active .messageWrapper");
    var selector = $('#chat li.active a').attr('href');
    session_id = selector && selector.replace(/#/, ''); //strip for ie7   
    $.ajax({
        url: AjaxURL + 'update_chat',
        dataType: "json",
        type: 'POST',
        data: {session_id: session_id},
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



function IsEmail(email) {
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}