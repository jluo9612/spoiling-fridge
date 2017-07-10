var app = angular.module("awesomeapp", []);

app.controller("listController", listController);

listController.$inject = ['$http'];

function listController ($http) {
  // view model
  var vm = this;
  vm.search = function () {

    var input = document.getElementById("search").value;
    $http({
      url: "https://api.edamam.com/search",
      method: "GET",
      params: {
        q: input,
        app_id: "4f480d5a",
        app_key: "94957ffe7eeda4b44fba310ac8e64eec"
      }
    }).then(function successCallback(response) {
      // on success
      alert("success");
      console.log(response);
      vm.data = response.data.hits;
    }, function errorCallback() {
      alert("Request failed. Please check your Internet connection and try again.");
    });

  }


}
