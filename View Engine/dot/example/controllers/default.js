exports.install = function(framework) {
	framework.route('/', view_homepage);
};

function view_homepage() {
	var self = this;
	self.view('index', { 'name': 'Jake', 'age': 31 });
}