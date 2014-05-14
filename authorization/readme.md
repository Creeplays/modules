# Authorization module

- copy **authorization.js** to __/your-totaljs-website/modules/__
- [EXAMPLE](https://github.com/petersirka/total.js-modules/tree/master/authorization/example)

## Properties and Functions and Events

```javascript
var auth = framework.module('authorization');

// ==========================================
// PROPERTIES
// ==========================================

auth.options.cookie = '__user'; // cookie name, default __user
auth.options.autoLogin = true; // default true
auth.options.expireSession = 10; // in minutes, default 10
auth.options.expireCookie = 10; // in days, defualt 10

auth.online; // get online users

// ==========================================
// METHODS
// ==========================================

/*
	Login an user
	@controller {Controller}
	@id {Number or String}
	@user {Object}
	@expire {Number} :: expire in minutes
	return {Module}
*/
auth.login(controller, id, user, expire);

/*
	Logoff an user
	@controller {Controller}
	@id {Number or String} :: Id user
	return {Module}
*/
auth.logoff(controller, id);

/*
	Change an user
	@id {Number or String}
	@newUser {Object}
	return {Users}
*/
auth.change(id, newUser);

/*
	Update an user
	@id {Number or String}
	@fn {Function} :: function(user) {}
	return {Users}
*/
auth.update(id, fn);

/*
	Update an user
	@id {Number or String}
	expire {Date}
	return {Users}
*/
auth.setExpire(id, expire);


// ==========================================
// EVENTS
// ==========================================

auth.on('login', function(id, user) {});
auth.on('logoff', function(id, user) {});
auth.on('change', function(id, user, old) {});
auth.on('online', function(online) {});
auth.on('expire', function(id, user) {});
```

### /controllers/default.js

```javascript
exports.install = function(framework) {
	// ...
	// ...
	// ...
	framework.route('/xhr/login/', json_login);
	framework.route('/xhr/logoff/', json_logoff, ['authorize']);
	framework.route('/', view_authorize, ['authorize']);
};

function json_login() {

	var self = this;
	var auth = self.module('authorization');

    // read user information from database
    // this is an example
	var user = { id: '1', alias: 'Peter' };

    // create cookie
    // save to session
	// @controller {Controller}
	// @id {String}
	// @user {Object}
	auth.login(self, user.id, user);

	self.json({ r: true });
}

function json_logoff() {

	var self = this;
	var auth = self.module('authorization');
	var user = self.user;

    // remove cookie
    // remove user session
	// @controller {Controller}
	// @id {String}
	auth.logoff(self, user.id);

	self.json({ r: true });
}

function view_authorize() {
	var self = this;
	var user = self.user;

	// user.id
	// user.alias

	self.view('profile');
}

```

### /definitions/authorization.js

```javascript
framework.once('load', function() {

	var auth = self.module('authorization');

	auth.onAuthorization = function(id, callback, flags) {

        // - this function is cached
        // - here you must read user information from a database
        // - insert the user object into the callback (this object will be saved to session/cache)
        callback({ id: '1', alias: 'Peter Sirka' });

        // if user not exist then
        // callback(null);
	};

});
```

__IMPORTANT__ in practice:

```javascript
framework.once('load', function() {

	var auth = self.module('authorization');

	auth.onAuthorization = function(id, callback, flags) {
		var filter = function(user) {
			return user.id === id;
		};

		framework.database('users').one(filter, function(user) {

			if (user === null) {
				callback(null);
				return;
			}

			callback(user);
		});
	};

});
```

### How to use roles?

> Use a definition.

```javascript
framework.once('load', function() {

	var auth = self.module('authorization');

	auth.onAuthorization = function(id, callback, flags) {

        // - this function is cached
        // - here you must read user information from a database
        // - insert the user object into the callback (this object will be saved to session/cache)
        callback({ id: '1', alias: 'Peter Sirka', roles: ['admin'] });

        // if user not exist then
        // callback(null);
	};

});

// Documentation: http://docs.totaljs.com/Framework/#framework.on('controller')
framework.on('controller', function(self, name) {

	var user = self.user;
	if (user === null)
		return;

	var length = user.roles.length;
	for (var i = 0; i < length; i++) {

		var role = '!' + user.roles[i];
		if (self.flags.indexOf(role) === -1) {

			// cancel executing of controller
			self.cancel();

			// redirect
			self.redirect('/you-do-not-have-permission/')
			return;
		}

	}
});
```