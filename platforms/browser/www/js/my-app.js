var $$ = Dom7;

var base_path = 'http://ilpc.ksm-if.com/'; // root path
var app_path = base_path + 'application/'; // php folder path
var asset_path = app_path + 'assets/'; // asset folder path

var app = new Framework7({
	name: '', // app name
	id: '', // package name
	root: '#app',
	theme: 'md',
	cache: false,
	panel: { swipe: 'left' },
	routes: [
	  {
	  	path: '/index/',
	  	url: 'index.html'
	  },
	  {
	  	path: '/login/',
	  	url: 'pages/login.html',
	  	on: {
	  	  pageInit: function(e, page) {

	  		app.panel.disableSwipe();

	  		$$('#btnLogin').on('click', function() {
	  			var username = $$('#username').val();
	  			var password = $$('#password').val();

	  			app.request.post(app_path + 'auth.php',
	  			{
	  				action: 'login',
	  				username: username,
	  				password: password
	  			},
	  			function(data) {
	  				
	  				var obj = JSON.parse(data);
					app.dialog.progress();

					var ret = obj.split(';');

					setTimeout(function() {
						app.dialog.close();

						if(ret[0] == 'SUC') {
							localStorage.setItem('idAdmin', ret[1]);
							localStorage.setItem('title', ret[2]);
							localStorage.setItem('idPost', ret[3]);

							if(localStorage.getItem('title') == 'admin')
								page.router.navigate('/post/', { reloadAll: true });
							else
								page.router.navigate('/home/', { reloadAll: true });
						}
						else {
							app.dialog.alert("Invalid username or password!");
						}
		  				
					}, 500);

	  			});
	  		});

	  	  },
	  	  pageAfterIn: function(e, page) {

	  	  	if(localStorage.idAdmin) {
	  	  		if(localStorage.getItem('title') == 'admin')
	  	  			page.router.navigate('/post/', { reloadAll: true });
	  	  		else
	  	  			page.router.navigate('/home/', { reloadAll: true });
	  	  	}

	  	  }
	  	}
	  },

	  ///////////////////
	  // GUARD ROUTING //
	  ///////////////////

	  {
	  	path: '/home/',
	  	url: 'pages/home.html',
	  	on: {
	  	  pageInit: function(e, page) {

	  	  	var idAdmin = localStorage.getItem('idAdmin');
	  	  	var idPost = localStorage.getItem('idPost');

	  		app.request.post(app_path + 'home.php', 
				{
					action: 'getGuard',
					idAdmin: idAdmin
				},
				function(data){
					var obj = JSON.parse(data);

					$$('#postType').append(obj['postType'].toUpperCase());
					$$('#postId').append("POST " + obj['idPost']);
					$$('#postName').append(obj['name']);
				});

	  	  	app.request.post(app_path + 'home.php',
				{
					action: 'getTeamsNotDone',
					idPost: idPost
				},
				function(data){
					var obj = JSON.parse(data);
					var html = Template7.compile($$('#t7TeamsNotDone').html())(obj);
					$$('#listTeamsNotDone').html(html);
				});

	  		app.request.post(app_path + 'home.php', 
				{
					action: 'getTeamsDone',
					idPost: idPost
				},
				function(data){
					var obj = JSON.parse(data);
					var html = Template7.compile($$('#t7TeamsDone').html())(obj);
					$$('#listTeamsDone').html(html);
				});
	  	  	
	  	  	if(localStorage.idAdmin){
				$$('.btnLogout').on('click', function() {
					app.dialog.confirm("Are you sure?", "Logout", function() {
						app.dialog.progress();
						setTimeout(function() {
							app.dialog.close();

							localStorage.removeItem('idAdmin');
							localStorage.removeItem('title');
							localStorage.removeItem('idPost');

							page.router.navigate('/login/', { animate: false, reloadAll: true });
						}, 500);
					});
				});
			}

	  	  },
	  	  pageAfterIn: function(e, page) {

	  	  	if(!localStorage.idAdmin) {
	  	  		page.router.navigate('/login/', { reloadAll: true });
	  	  	}
	  	  	else {
	  	  		if(localStorage.title == 'gamemaster') {
	  	  			$$('.panel-gamemaster').show();
	  	  			$$('.panel-admin').hide();
	  	  		}
	  	  		else if(localStorage.title == 'admin') {
	  	  			$$('.panel-gamemaster').hide();
	  	  			$$('.panel-admin').show();
	  	  		}
	  	  	}
	  	  }
	  	}
	  },
	  {
	  	path: '/score/:id',
	  	url: 'pages/score.html',
	  	on: {
	  	  pageInit: function(e, page) {
  	  		var idTeam = page.router.currentRoute.params.id;
	  	  	var idPost = localStorage.getItem('idPost');

	  		app.request.post(app_path + 'score.php', 
			{
				action: 'getTeam',
				idTeam: idTeam
			},
			function(data){
				var team = JSON.parse(data);
				$$('#teamName').append(
	              '<div class="item-inner">' +
	                '<div class="item-title item-label">Team</div>' +
	                '<div class="item-input">' +
	                  '<input type="hidden" name="team-id" disabled="true" value="' + team['id'] + '">' +
	                  '<input type="text" name="team-name" disabled="true" value="' + team['name'] + '">' +
	                '</div>' +
	              '</div>'
				);
			});

	  		app.request.post(app_path + 'score.php', 
			{
				action: 'listScore',
				idPost: idPost
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7Score').html())(obj);
				$$('#teamScore').html(html);
			});

	  		$$('#btnsubmit').on('click', function(){
	  			var point = $$('#teamScore').val();

	  			app.request.post(app_path + 'score.php', 
				{
					action: 'inputScore',
					idTeam: idTeam,
					idPost: idPost,
					point: point
				},
				function(data){
					var obj = JSON.parse(data);

					if(obj == 'success'){
						app.dialog.alert("Leaderboard Updated!");
						page.router.navigate('/home/', { reloadAll: true });
					}
					else {
						app.dialog.alert("Fail to Update Leaderboard");
					}
				});
	  		});
	  	  }
	  	}
	  },
	  {
	  	path: '/scoreboard/',
	  	url: 'pages/scoreboard.html',
	  	on: {
	  	  pageInit: function(e, page) {

	  	  	var idPost = localStorage.getItem('idPost');

	  	  	app.request.post(app_path + 'scoreboard.php',
	  	  	{
	  	  		action: 'getScore',
	  	  		idPost: idPost
	  	  	},
	  	  	function(data){
	  	  		var obj = JSON.parse(data);

	  	  		var html = Template7.compile($$('#t7Scoreboard').html())(obj);
				$$('#listScoreboard').html(html);
	  	  	});

	  	  	setInterval( function(){
				app.request.post(app_path + 'scoreboard.php',
		  	  	{
		  	  		action: 'getScore',
		  	  		idPost: idPost
		  	  	},
		  	  	function(data){
		  	  		var obj = JSON.parse(data);
		  	  		var html = Template7.compile($$('#t7Scoreboard').html())(obj);
					$$('#listScoreboard').html(html);
		  	  	});
			}, 5000);

	  	  }
	  	}
	  },

	  ///////////////////
	  // ADMIN ROUTING //
	  ///////////////////

	  {
	  	path: '/post/',
	  	url: 'pages/admin/post.html',
	  	on: {
	  	  pageInit: function(e, page) {
	  	  	// localStorage.removeItem('idAdmin');
	  	  	// localStorage.removeItem('title');
	  	  	// localStorage.removeItem('idPost');

	  	  	app.panel.enableSwipe();

	  	  	if(localStorage.idAdmin){
				$$('.btnLogout').on('click', function() {
					app.dialog.confirm("Are you sure?", "Logout", function() {
						app.dialog.progress();
						setTimeout(function() {
							app.dialog.close();

							localStorage.removeItem('idAdmin');
							localStorage.removeItem('title');
							localStorage.removeItem('idPost');
							
							page.router.navigate('/login/', { animate: false, reloadAll: true });
						}, 500);
					});
				});
			}

			app.request.post(app_path + 'post.php', 
			{ 
				action: 'getPost'
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7Posts').html())(obj);
				$$('#listPosts').html(html);
			});

			////////////////
			// Game Modal //
			////////////////
			app.request.post(app_path + 'game.php',
			{ 
				action: 'getGameType',
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7GameType').html())(obj);
				$$('#selectGameType').append(html);
			});

			app.request.post(app_path + 'game.php',
			{ 
				action: 'getPostType',
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7PostType').html())(obj);
				$$('#selectPostType').append(html);
			});

			$$('#btnAddGame').on('click', function() {
				var gameName = $$('#gameName').val();
				var gameType = $$('select[name="gameType"]').val();
				var postType = $$('select[name="postType"]').val();

				console.log(gameName);
				console.log(gameType);
				console.log(postType);

				app.request.post(app_path + 'game.php',
				{
					action: 'insertGame',
					gameName: gameName,
					gameType: gameType,
					postType: postType
				},
				function(data) {
					var obj = JSON.parse(data);

					if(obj == 'SUC')
						app.dialog.alert("Game Added!");
					else
						app.dialog.alert("Fail to Add Game");
				});
			});

			////////////////
			// Post Modal //
			////////////////
			app.request.post(app_path + 'game.php',
			{ 
				action: 'getFreeGame',
				idPost: '-1'
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7PostGame').html())(obj);
				$$('#selectPostGame').append(html);
			});

			$$('#btnAddPost').on('click', function() {
				var postId = $$('input[name="postId"]').val();
				var postGame = $$('select[name="postGame"]').val();

				if(postId == "") postId = -1;

				app.request.post(app_path + 'post.php',
				{
					action: 'insertPost',
					postId: postId,
					postGame: postGame
				},
				function(data) {
					var obj = data;
					
					if(obj == 'SUC')
						app.dialog.alert("Post Added!");
					else
						app.dialog.alert("Fail to Add Post!");
				});
			});

			/////////////////
			// Guard Modal //
			/////////////////
			app.request.post(app_path + 'guard.php',
			{ 
				action: 'getAvailableGuard'
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7GuardUsername').html())(obj);
				$$('#selectGuardUsername').append(html);
			});

			app.request.post(app_path + 'game.php',
			{ 
				action: 'getGuardGame'
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7GuardGame').html())(obj);
				$$('#selectGuardGame').append(html);
			});

			$$('#btnSetGuard').on('click', function(){
				var admin = $$('select[name="guardUsername"]').val();
				var game = $$('select[name="gameId"]').val();

				app.request.post(app_path + 'guard.php',
				{
					action: 'setGuard',
					idAdmin: admin,
					idGame: game
				},
				function(data) {
					var obj = JSON.parse(data);

					if(obj == 'success')
						app.dialog.alert("Guard Has Set!");
					else
						app.dialog.alert("Fail to Set Guard");
				});
			});

	  	  },
	  	  pageAfterIn: function(e, page) {

	  	  	if(!localStorage.idAdmin) {
	  	  		page.router.navigate('/login/', { reloadAll: true });
	  	  	}
	  	  	else {
	  	  		if(localStorage.title == 'gamemaster') {
	  	  			$$('.panel-gamemaster').show();
	  	  			$$('.panel-admin').hide();
	  	  		}
	  	  		else if(localStorage.title == 'admin') {
	  	  			$$('.panel-gamemaster').hide();
	  	  			$$('.panel-admin').show();
	  	  		}
	  	  	}

	  	  }
	  	}
	  },
	  {
	  	path: '/post/:id/',
	  	url: 'pages/admin/post-input.html',
	  	on: {
	  	  pageInit: function(e, page) {

	  	  	app.panel.enableSwipe();

	  	  	var idPost = page.router.currentRoute.params.id;
			$$('#postName').val(idPost);

			app.request.post(app_path + 'game.php',
			{ 
				action: 'getGame',
				idPost: idPost
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7Game').html())(obj);
				$$('#selectGame').html(html);
			});

			$$('#btnUpdateGame').on('click', function(){
				var chosenGame = $$('#selectGame').val();

				app.request.post(app_path + 'post.php',
				{
					action: 'updateGamePost',
					idPost: idPost,
					idGame: chosenGame
				},
				function(data){
					var obj = JSON.parse(data);
					
					if(obj == 'success'){
						app.dialog.alert("Game has updated!");
						page.router.navigate('/posts/', { reloadAll: true });
					}
					else {
						app.dialog.alert("Fail to Update Game");
					}
				});
			});

	  	  }
	  	}
	  },
	  {
	  	path: '/post-adv/',
	  	url: 'pages/admin/post-adv.html',
		smartSelect: {
			formColorTheme: 'black',
			navbarColorTheme: 'black'
		},
	  	on: {
	  	  pageInit: function(e, page) {
	  	  	app.panel.enableSwipe();

	  	  	if(localStorage.idAdmin){
				$$('.btnLogout').on('click', function() {
					app.dialog.confirm("Are you sure?", "Logout", function() {
						app.dialog.progress();
						setTimeout(function() {
							app.dialog.close();

							localStorage.removeItem('idAdmin');
							localStorage.removeItem('title');
							localStorage.removeItem('idPost');
							
							page.router.navigate('/login/', { animate: false, reloadAll: true });
						}, 500);
					});
				});
			}

			app.request.post(app_path + 'post.php', 
			{ 
				action: 'getPostAdv',
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7PostsAdv').html())(obj);
				$$('#listPostsAdv').html(html);
			});

	  	  },
	  	  pageAfterIn: function(e, page) {

	  	  	if(!localStorage.idAdmin) {
	  	  		page.router.navigate('/login/', { reloadAll: true });
	  	  	}
	  	  	else {
	  	  		if(localStorage.title == 'gamemaster') {
	  	  			$$('.panel-gamemaster').show();
	  	  			$$('.panel-admin').hide();
	  	  		}
	  	  		else if(localStorage.title == 'admin') {
	  	  			$$('.panel-gamemaster').hide();
	  	  			$$('.panel-admin').show();
	  	  		}
	  	  	}

	  	  }
	  	}
	  },
	  {
	  	path: '/team/',
	  	url: 'pages/admin/team.html',
	  	on: {
	  	  pageInit: function(e, page) {
	  	  	var length;

			app.request.post(app_path + 'team.php', 
				{ 
					action: 'showTeams'
				},
				function(data){
					var obj = JSON.parse(data);
					length = obj['teams'].length;
					var html = Template7.compile($$('#t7Team').html())(obj);
					$$('#listTeams').html(html);
				});

			$$(document).on('change', '.toggle', function(){
				$$(this).toggleClass('checked');
			});

			$$('#btnSaveTeam').on('click', function()
			{
				var teamlist = [];

				app.dialog.confirm("Save Teams?", "Team", 
					function(e){
					
						for(var i = 1; i <= length; i++){
							if($$('input[value="' + i + '"]').parent().hasClass('checked')){
								var teamId = $$('input[value="' + i + '"]').data('id');
								var teamname = $$('input[value="' + i + '"]').data('name');
								teamlist.push(teamId + ";" + teamname);
							}
						}
						app.request.post(app_path + 'team.php',
						{
							action: 'insertTeams',
							teams: teamlist
						},
						function(data){
							page.router.navigate('/post/');
						});

					});
			});
		   }
		 }			
	  },
	  {
	  	path: '/game/',
	  	url: 'pages/admin/game.html',
	  	on: {
	  	  pageInit: function(e, page) {
	  	  	app.panel.enableSwipe();

			app.request.post(app_path + 'game.php', 
				{ 
					action: 'getGameType'
				},
				function(data){
					var obj = JSON.parse(data);
					var html = Template7.compile($$('#t7Game').html())(obj);
					$$('#games').html(html);
				});
			
			app.request.post(app_path + 'game.php', 
				{ 
					action: 'getPostType'
				},
				function(data){
					var obj = JSON.parse(data);
					var html = Template7.compile($$('#t7Post').html())(obj);
					$$('#posts').html(html);
				});

			$$('#btnsubmit').on('click', function(){
				var name = $$('#name').val();
				var game = $$('#games').val();
				var post = $$('#posts').val();

				app.request.post(app_path + 'game.php',
				{
					action: 'insertGamePost',
					name: name,
					idGame: game,
					idPost: post
				},
				function(data){
					var obj = JSON.parse(data);
					
					if(obj == 'success'){
						app.dialog.alert("GamePost has added!");
						page.router.navigate('/posts/', { reloadAll: true });
					}
					else {
						app.dialog.alert("Fail to Add GamePost");
					}
				});
			});
	  	  }
	  	}
	  }
	]
});

var mainView = app.views.create('.view-main', { url: '/login/' });