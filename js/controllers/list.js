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
        app_key: "94957ffe7eeda4b44fba310ac8e64eec",
        from: 0,
        to: 200
      }
    }).then(function successCallback(response) {
      // on success
      console.log(response);
      vm.data = response.data.hits;

      if (vm.data.length == 0) {
        document.getElementById("src-msg").innerHTML = "<h2>Nothing was found! Please check your inputs.</h2>";
      } else {
        document.getElementById("src-msg").innerHTML = "<h2>Prepare to feast!</h2>";
      }

    }, function errorCallback() {
      document.getElementById("src-msg").innerHTML = "<h2>Request failed. Please check your Internet connection and try again.</h2>";
    });

  }


}
