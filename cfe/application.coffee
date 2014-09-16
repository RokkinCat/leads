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
    $http.post("https://rkkn.slack.com/services/hooks/incoming-webhook?token=KQUBgssIs8QPyLtoLCmirZ3H", {
        text: body,
        icon: "https://avatars1.githubusercontent.com/u/1031174?v=2&s=200",
        username: "leads-#{$scope.current_user.thirdPartyUserData.login}"
      })

    $scope.messages.$add(user:$scope.current_user, created_at: new Date().getTime(), body:body).finally () ->
      $scope.loading = false
  $scope.delete = (message) ->
    $scope.messages.$remove(message).finally () ->
      $scope.loading = true

  $scope.logout = ->
    authClient.logout()
    $scope.current_user = null

  $scope.save = (message) ->
    $scope.messages.$save(message)


app.directive "markdown", () ->
  restrict: "A",
  link: ($scope, $element, $attrs) ->
    $scope.$watch('message.body', () ->
      converter = new Showdown.converter({extensions: []})

      text = $element.text()
      text = text.replace(/^\s+/,"")
      text = text.replace(/(#.+?)\b/g, """<a class="hashtag">$1</a>""")

      $element.html(converter.makeHtml(text))

      $element.find("a").on("click", (event) ->
        if angular.element(event.target).hasClass("hashtag")
          $scope.search.text = angular.element(event.target).text()
          $scope.$apply()
      )
      )

app.filter "ago", () ->
  (input) ->
    moment(input).fromNow()
