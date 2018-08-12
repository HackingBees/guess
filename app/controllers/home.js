var tree = {};

module.exports = function(app) {
	app.get('/', function (req,res,next) {
		// / is home
        res.redirect('/home');
    });
    app.get('/home', function (req,res,next) {
		// starting here, listing existing category files from data folder
        var sysuser = req.body;
		const fs=app.get('fs');
		const dataFolder = './app/data/';
		var categories = [{id:0, name:"I will teach you something new!"}];
		var index=1;
		fs.readdirSync(dataFolder).forEach(file => {
		  	categories.unshift({id:index, name:file});
			index++
		})
		res.render('home/home',{list:categories});
    });
	app.get('/play', function(req,res,next) {
		// starting Game
		if (req.query.selectCategory == "I will teach you something new!") {
			// new Category to be learnt
			var category = req.query.newCategoryInput;
			tree = {};
			res.render('home/learnCategory', {category:category});
		} else {
			// existing Category
			if (req.query.category) {
				// restarted from previous match
				var category = req.query.category;
			} else {
				// freshly selected from home page
				var category = req.query.selectCategory;
			}
			// read Category file
			const fs=app.get('fs');
			var fileName ="./app/data/" + category;
			tree=JSON.parse(fs.readFileSync(fileName, 'utf8'));
			res.render('home/play',{category:category});
		}
	});
	app.get('/game', function(req,res,next) {
		// new Round
		var data =JSON.parse(req.query.data);
		var treeNode = tree[data.nextNode];
		if (tree[data.nextNode].element=="") {
			// this is a question - make the question
			res.render('home/game',{node:treeNode, data:data});
		} else {
			// found an element - will make a guess
			res.redirect('/guess?data='+req.query.data);
		}
	});
	app.get('/guess', function(req,res,next) {
		// making a guess
		var data =JSON.parse(req.query.data);
		var treeNode = tree[data.nextNode];
		res.render('home/guess',{node:treeNode, data:data});
	});

	app.get('/new', function(req,res,next) {
		// missed - get info of a new element
		var data =JSON.parse(req.query.data);
		var treeNode = tree[data.node];
		res.render('home/new',{node:treeNode, data:data});
	});
	app.get('/finish', function(req,res,next) {
		// finished match
		var data =JSON.parse(req.query.data);
		res.render('home/finish',{node:data.node, data:data});
	});
	app.get('/learn',function(req,res,next) {
		// will learn (save) a new element
		//copy current node to a new one
		var existingElement=Object.keys(tree).length+1;
		tree[existingElement]=tree[req.query.node];
		//create a new node with the new element
		var newElement=Object.keys(tree).length+1;
		var newEntry = { question: "", element:req.query.newEntry, answerYes: "0", answerNo: "-1"};
		tree[newElement]=newEntry;
		// transform the current node into a new question node
		if (req.query.answerForNew == 'No') {
			tree[req.query.node] = {question: req.query.newQuestion, element: "", answerYes:existingElement, answerNo:newElement};
		} else {
			tree[req.query.node] = {question: req.query.newQuestion, element: "", answerYes:newElement, answerNo:existingElement};
		}
		// save category file
		const fs=app.get('fs');
		var fileName ="./app/data/" + req.query.category
		fs.writeFile(fileName, JSON.stringify(tree), function (err) {
			if (err) throw err;
			console.log('Saved new version of '+fileName+' tree.');
		});
		var data={action:"tryagain", element:req.query.newEntry, category:req.query.category};
		// end match
		res.render('home/finish',{node:data.node, data:data});
	});
	app.get('/saveCategory',function(req,res,next) {
		// learning (saving) a new category
		if (req.query.answerForS1 == "Yes") {
			var yesAnswer = "2";
			var noAnswer = "3";
		} else {
			var yesAnswer = "3";
			var noAnswer = "2";
		}
		// all categories must start with a question, an element for Yes and one for No
		var questionNode = { question: req.query.question, element: "", answerYes: yesAnswer, answerNo: noAnswer };
		var element1Node = { quesion: "", element: req.query.specimen1, answerYes: "0", answerNo:"-1"};
		var element2Node = { quesion: "", element: req.query.specimen2, answerYes: "0", answerNo:"-1"};
		tree["1"]=questionNode;
		tree["2"]=element1Node;
		tree["3"]=element2Node;
		// save new category file
		const fs=app.get('fs');
		var fileName ="./app/data/" + req.query.category
		fs.writeFile(fileName, JSON.stringify(tree), function (err) {
			if (err) throw err;
			console.log('Saved new '+fileName+' tree.');
		});
		var data={action:"tryagain", element:req.query.newEntry, category:req.query.category};
		// sart playing newly learnt category
		res.redirect('/play?category='+req.query.category);
	});

}
