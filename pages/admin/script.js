$(document).ready(() => {
  $("#logout-button").on("click", function () {
    window.location.replace("/");
  });

  $("#user-button").on("click", function () {
    $("#textareawrite").css('display', 'flex');
  });

  $("#cancel-ticket").on("click", function () {
    $("#textareawrite").css('display', 'none');
  });

  $("#send-user-data").on("click", function () {
    $("#textareawrite").css('display', 'none');
    let user = $("#user").val();
    let name = $("#name").val();
    let email = $("#email").val();
    let password = $("#password").val();
    let confirmPassword = $("#confirmpassword").val();

    if (user && name && email && password && password === confirmPassword) {
      $.ajax({
        url: "/signinuser",
        type: "POST",
        data: { user: user, name: name, email: email, password: password },
        success: function (data) {
          console.log(data);
          // if (data === "/") {
          //   window.location.replace(`${data}`);
          //   return true;
          // }
          $("#user-table").append(
            ` 
            <tr>
              <td>${data.userName}</td>
              <td>${data.email}</td>
              <td>${data.class}</td>
              <td>${data.active}</td>
              <td>X</td>
            </tr>`
          );
          // $("#ticket-content").val("");
          $("#textareawrite").css('display', 'none');
        }
      });
    } else { $("#err-msg").val("Campo vazio e/ou senhas diferentes") }
  });

  $.ajax({
    url: "/getuserlist",
    type: "GET",
    data: {},
    success: function (data) {
      let positionData = Object.keys(data).length;
      if (data === "/") {
        window.location.replace(`${data}`);
        return true;
      }
      for (let i = 0; i < positionData;) {
        i++;
        $("#user-table").append(
          ` 
          <tr>
            <td>${data[i].userName}</td>
            <td>${data[i].email}</td>
            <td>${data[i].class}</td>
            <td>${data[i].active}</td>
            <td>X</td>
          </tr>`
        );
      }
    }
  });
});

