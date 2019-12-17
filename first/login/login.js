$(document).ready(function() {
  // 로그인 처리
  $('#login_btn').click(function(e) {
    debugger
    if ($("#user_id").val() == '') {
      alert('Please input ID.');
      $("user_id").focus();
      return false;
    }
    if ($("#user_password").val() == '') {
      alert('Please input Password.');
      $("user_password").focus();
      return false;
    }

    $.ajax({
      url: 'http://localhost:3000/members/login',
      type: 'POST',
      data: {
        id: $("#user_id").val(),
        password: $('#user_password').val(),
      },
      dataType: "text",
      success: function(response) {
        alert("1");
      },
      error: function(jqXHR, textStatus, errorThrown) {
          alert("Password does not match or ID does not exist.");

      }


    });

  });

});
