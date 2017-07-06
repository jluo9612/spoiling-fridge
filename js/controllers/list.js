(function() {

    var recipesData = [];

    angular
      .module("awesomeapp")
      .controller("listController", listController);

    function listController () {
      // view model
      var vm = this;
      vm.data = recipesData;
      console.log(vm.data);
    }


})();


function myFunction () {

    var input = document.getElementById("search").value;

    $.ajax({
        type: 'GET',
        crossDomain: true,
        url: "https://api.edamam.com/search",
        data: {
            q: input,
            app_id: "4f480d5a",
            app_key: "94957ffe7eeda4b44fba310ac8e64eec"
        },
        dataType: 'jsonp',
        success: function (response) {
            alert("success");
            console.log(response);
            recipesData = response.hits; // object: matching result that contains other data than the recipe
        },
        error: function () {
            alert("error");
        }
    });

}
