$(document).ready(() => {
  $(".delete-article").on("click", (e) => {
    $target = $(e.target);
    const id = $target.attr("data-id");
    $.ajax({
      type: "DELETE",
      url: "/articles/" + id,
      success: (response) => {
        alert("Deleting article");
        // alert(response);
        window.location.href = "/articles";
      },
      error: (err) => {
        console.log(err);
      },
    });
  });
});
