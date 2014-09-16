app = angular.module "leads", ["firebase"]

app.controller "LeadsCtrl", ($scope, $firebase, $http) ->
  firebase = new Firebase("https://luminous-heat-7629.firebaseIO.com")
  sync = $firebase(firebase)
  $scope.data = sync.$asObject()

  messages = new Firebase("https://luminous-heat-7629.firebaseIO.com/messages")
  messageSink = $firebase(messages)

  $scope.filter = null
  $scope.search = {text: ""}

  authClient = new FirebaseSimpleLogin firebase, (error, user) ->
    $http.get(user.thirdPartyUserData.organizations_url).then (data) ->
      if user.thirdPartyUserData.login in ["nickgartmann","joshdholtz","jeregrine","stoodder","Gregadeaux","mitchellhenke"]
        $scope.current_user = user
        $scope.messages = messageSink.$asArray()
      else
        alert("You are not a member of RokkinCat!")

  $scope.login = () ->
    $scope.logging_in = true
    authClient.login("github").finally () ->
      $scope.logging_in = false

  $scope.post = (body) ->
    $scope.loading = true
    $scope.messages.$add(user:$scope.current_user, created_at: new Date().getTime(), body:body).finally () ->
      $scope.loading = false

  $scope.delete = (message) ->
    $scope.messages.$remove(message).finally () ->
      $scope.loading = true

  $scope.logout = ->
    authClient.logout()
    $scope.current_user = null


app.directive "linkHashtags", ($timeout) ->
  link: ($scope, $element, $attrs) ->
    $scope.$watch 'message', ->
      text = $element.html()
      $element.html(text.replace(/(#.+\b)/g, """<a class="hashtag">$1</a>"""))
      $element.find("a").on("click", (event) ->
        if angular.element(event.target).hasClass("hashtag")
          $scope.search.text = angular.element(event.target).text()
          $scope.$apply()
      )


app.directive "markdown", () ->
  restrict: "A",
  link: ($scope, $element, $attrs) ->
    $scope.$watch('message', () ->
      converter = new Showdown.converter({extensions: []})
      text = $element.text().replace(/^\s+/,"")
      $element.html(converter.makeHtml(text))
      )

app.filter "ago", () ->
  (input) ->
    moment(input).fromNow()
