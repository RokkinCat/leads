var app;

app = angular.module("leads", ["firebase"]);

app.controller("LeadsCtrl", function($scope, $firebase, $timeout) {
  var authClient, firebase, messageSink, messages, sync;
  firebase = new Firebase("https://luminous-heat-7629.firebaseIO.com");
  sync = $firebase(firebase);
  $scope.data = sync.$asObject();
  messages = new Firebase("https://luminous-heat-7629.firebaseIO.com/messages");
  messageSink = $firebase(messages);
  $scope.messages = messageSink.$asArray();
  $scope.filter = null;
  $scope.search = {
    text: ""
  };
  authClient = new FirebaseSimpleLogin(firebase, function(error, user) {
    return $scope.current_user = user;
  });
  $scope.login = function() {
    $scope.logging_in = true;
    return authClient.login("github").then(function(user) {
      $scope.current_user = user;
      return $scope.$apply();
    })["finally"](function() {
      return $scope.logging_in = false;
    });
  };
  $scope.post = function(body) {
    var bodyCopy;
    $scope.loading = true;
    bodyCopy = body;
    $scope.body = "";
    return $scope.messages.$add({
      user: $scope.current_user,
      created_at: new Date().getTime(),
      body: bodyCopy
    })["finally"](function() {
      return $scope.loading = false;
    });
  };
  $scope["delete"] = function(message) {
    return $scope.messages.$remove(message)["finally"](function() {
      return $scope.loading = true;
    });
  };
  return $scope.logout = function() {
    authClient.logout();
    return $scope.current_user = null;
  };
});

app.directive("linkHashtags", function($timeout) {
  return {
    link: function($scope, $element, $attrs) {
      return $scope.$watch('message', function() {
        var text;
        text = $element.html();
        $element.html(text.replace(/(#.+)(\s)/g, "<a class=\"hashtag\">$1</a>$2"));
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

app.directive("markdown", function() {
  return {
    restrict: "A",
    link: function($scope, $element, $attrs) {
      return $scope.$watch('message', function() {
        var converter, text;
        converter = new Showdown.converter({
          extensions: []
        });
        text = $element.text().replace(/^\s+/, "");
        return $element.html(converter.makeHtml(text));
      });
    }
  };
});

app.filter("ago", function() {
  return function(input) {
    return moment(input).fromNow();
  };
});
