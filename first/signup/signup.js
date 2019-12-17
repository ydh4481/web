$(function() {
  // 회원 가입 처리
  var sta = [];
  $('#join-submit').click(function(e) {
    debugger
    e.preventDefault();
    if ($("#inputId").val() == '') {
      alert('Please input ID.');
      $("#inputId").focus();
      return false;
    }
    if ($("#inputName").val() == '') {
      alert('Please input Name.');
      $("#inputName").focus();
      return false;
    }
    if ($("#inputSid").val() == '') {
      alert('Please input Sid.');
      $("#inputSid").focus();
      return false;
    }

    if ($("#inputPassword").val() == '') {
      alert('Please input Password.');
      $("#inputPassword").focus();
      return false;
    }

    if ($("#inputPasswordCheck").val() == '') {
      alert('Please enter password again.');
      $("#inputPasswordCheck").focus();
      return false;
    }

    if ($("#inputPassword").val() !== $("#inputPasswordCheck").val()) {
      alert('The password is not the same.');
      return false;
    }

    if ($("#inputMobile").val() == '') {
      alert('Please input cell phone number.');
      $("#inputMobile").focus();
      return false;
    }
    if ($("#signup_manager").is(":checked") == false && $("#signup_buyer").is(":checked") == false && $("#signup_seller").is(":checked") == false) {
      alert('Please check status.');
      return false;
    }

    if ($("#signup_agree").is(":checked") == false) {
      alert('Please check agree.');
      return false;
    }
    if ($("input[type='checkbox']").filter(':checked').size() > 2) {
      alert('Please check only one status.');
      return false;
    } else {
      if ($("#signup_manager").is(":checked") == true) {
        sta = 'manager';
      }
      if ($("#signup_buyer").is(":checked") == true) {
        sta = 'buyer';
      }
      if ($("#signup_seller").is(":checked") == true) {
        sta = 'seller';
      }

    }
    $.ajax({
      url: 'http://localhost:3000/members',
      type: 'POST',
      data: {
        'id': $("#inputId").val(),
        'sid': $("#inputSid").val(),
        'name': $("#inputName").val(),
        'password': $('#inputPassword').val(),
        'classification': sta,
        'phone': $("#inputMobile").val()
      },
      dataType: "text",
      success: function() {
        alert("Welcome!");
        location.replace('../home.html');
      },
      error: function(jqXHR, textStatus, errorThrown) {
        if ((jqXHR.status+"")[0]!=='2'){
          alert("ID already exist.");
        }
      }


    });

  });

});
