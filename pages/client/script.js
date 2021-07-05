$(document).ready(() => {

  $("#logout-button").on("click", function () {
    window.location.replace("/");
  });

  $.ajax({
    url: "/getuserlist",
    type: "GET",
    data: {},
    success: function (data) {
      let positionData = Object.keys(data).length;
      console.log(data);
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
          </tr>`
        );
      }
    }
  });

});

