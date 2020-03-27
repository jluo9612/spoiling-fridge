var app = angular.module("awesomeapp", []);

app.controller("listController", listController);

listController.$inject = ['$http'];

function listController ($http) {
  // view model
  var vm = this;
  vm.search = function () {
    var loader = document.getElementsByClassName("loader-container")[0];
    loader.style.display = "flex";
    var input = document.getElementById("search").value;
    $http({
      url: "https://cors-anywhere.herokuapp.com/https://api.edamam.com/search",
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

      // console.log(response);
        loader.style.display = "none";

      vm.data = response.data.hits;
      // if it's loading, show animation

      // if (vm.data.length == 0) {
      //   document.getElementById("msg-top").innerHTML = "<h2>Nothing was found! Please check your inputs.</h2>";
      // } else {
      //   document.getElementById("msg-top").innerHTML = "<h2>Prepare to feast!</h2>";
      // }

    }, function errorCallback() {
      document.getElementById("msg-top").innerHTML = "<h2>Request failed. Please check your Internet connection and try again.</h2>";
    });
  }

   vm.showAll = true;
   vm.checkChange = function() { // triggers filter
       for(var t in vm.dietArray){
           if(vm.dietArray[t].on){
               vm.showAll = false;
               return;
           }
       }
       vm.showAll = true;
   };

   // filter logic
   vm.filtered = function(a) { // a = every hit
      // console.log(a);
      if(vm.showAll) { return true; }
      var sel = false;
      for(diet in vm.dietArray){
           var t = vm.dietArray[diet]; // every object in dietArray
           if(t.on){
               if(a.recipe.healthLabels.indexOf(t.name) === -1){ // maintain later; not all labels are healthLabels
                   return false;
               }else{
                   sel = true;
               }
           }
       }
      return sel;
   };

   // filter labels
   vm.dietArray = [
     {name: "Vegetarian", on: false},
     {name: "Vegan", on: false},
     {name: "Gluten-free", on: false},
     {name: "Low-sodium", on: false}
    ];

}
