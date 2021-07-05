$(document).ready(() => {
  $("#login-button").on("click", function () {
    let user = $("#user").val();
    let password = $("#password").val();

    if (user && password) {
      $.ajax({
        url: "/login",
        type: "POST",
        data: { user: user, password: password },
        success: function (data) {
          console.log('post works');
          if (data === "/") {
            // window.location.replace(`${data}`);
            console.log('if works');
            $("#msg-err").append(`
              <p>Invalid User or Password. Please try again.</p>`
            );
            return true;
          }
          window.location.replace(`${data}`);
        }
      });
    }
  })
});



