var app;

app = angular.module("leads", ["firebase"]);

app.controller("LeadsCtrl", function($scope, $firebase, $http) {
  var authClient, firebase, messageSink, messages, sync;
  firebase = new Firebase("https://luminous-heat-7629.firebaseIO.com");
  sync = $firebase(firebase);
  $scope.data = sync.$asObject();
  messages = new Firebase("https://luminous-heat-7629.firebaseIO.com/messages");
  messageSink = $firebase(messages);
  $scope.filter = null;
  $scope.search = {
    text: ""
  };
  authClient = new FirebaseSimpleLogin(firebase, function(error, user) {
    return $http.get(user.thirdPartyUserData.organizations_url).then(function(data) {
      var _ref;
      if ((_ref = user.thirdPartyUserData.login) === "nickgartmann" || _ref === "joshdholtz" || _ref === "jeregrine" || _ref === "stoodder" || _ref === "Gregadeaux" || _ref === "mitchellhenke") {
        $scope.current_user = user;
        return $scope.messages = messageSink.$asArray();
      } else {
        return alert("You are not a member of RokkinCat!");
      }
    });
  });
  $scope.login = function() {
    $scope.logging_in = true;
    return authClient.login("github")["finally"](function() {
      return $scope.logging_in = false;
    });
  };
  $scope.post = function(body) {
    $scope.loading = true;
    $http.post("https://rkkn.slack.com/services/hooks/incoming-webhook?token=KQUBgssIs8QPyLtoLCmirZ3H", {
      text: body,
      icon: "https://avatars1.githubusercontent.com/u/1031174?v=2&s=200",
      username: "leads-" + $scope.current_user.thirdPartyUserData.login
    });
    return $scope.messages.$add({
      user: $scope.current_user,
      created_at: new Date().getTime(),
      body: body
    })["finally"](function() {
      return $scope.loading = false;
    });
  };
  $scope["delete"] = function(message) {
    return $scope.messages.$remove(message)["finally"](function() {
      return $scope.loading = true;
    });
  };
  $scope.logout = function() {
    authClient.logout();
    return $scope.current_user = null;
  };
  return $scope.save = function(message) {
    return $scope.messages.$save(message);
  };
});

app.directive("markdown", function() {
  return {
    restrict: "A",
    link: function($scope, $element, $attrs) {
      return $scope.$watch('message.body', function() {
        var converter, text;
        converter = new Showdown.converter({
          extensions: []
        });
        text = $element.text();
        text = text.replace(/^\s+/, "");
        text = text.replace(/(#.+?)\b/g, "<a class=\"hashtag\">$1</a>");
        $element.html(converter.makeHtml(text));
        return $element.find("a").on("click", function(event) {
          if (angular.element(event.target).hasClass("hashtag")) {
            $scope.search.text = angular.element(event.target).text();
            return $scope.$apply();
          }
        });
      });
    }
  };
});

app.filter("ago", function() {
  return function(input) {
    return moment(input).fromNow();
  };
});
