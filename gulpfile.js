///////
////TODO
//- Connections Local
//- Semantic versioning
//- Versions to backbase properties
//- progress bar zipping
//- keys.properties to config
//- generating headers gulp

var fs = require('fs');
var gulp = require('gulp');
var util = require('util');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var compileLess = require('gulp-less');
var decompress = require('gulp-decompress');
var del = require('del');
var inject = require('gulp-inject-string');
var insert = require('gulp-insert');
var git = require('gulp-git');
var gutil = require('gulp-util');
var gzip = require('gulp-gzip');
var logger = require('gulp-logger');
var ngAnnotate = require('gulp-ng-annotate');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var taskListing = require('gulp-task-listing');
var templateCache = require('gulp-angular-templatecache');
var wrap = require('gulp-wrap');
var uglify = require('gulp-uglify');
var unzip = require('gulp-unzip');
var zip = require('gulp-zip');
var simpleGit = require('simple-git');
var argv = require('yargs').argv;

var modelroot = './source/model/';
	
	
gulp.task('clone',[('checkoutmaster')], function(done) {	
	try {
	fs.accessSync('./.git');
	done();
	}catch(e){
		git.clone('https://github.com/woutermesker/npm-gulp', 
		{args: './source/model'},function(err){
			if (err)return done(err);
			process.chdir(modelroot);
			done();
		});		
	}
});

gulp.task('pull',[('clone')], function(done) {	
		try {	
		fs.accessSync('./.git');
		git.pull( function (err) {
		if(err){console.log(err)}else{return done(err);}
		done();
		});
		}catch(e){
		}
	
});

gulp.task('checkout',[('pull')], function(done) {
		
		var tag = String(argv.model);	
		git.checkout(tag, {args:'-q'}, 
		    function(err){
				    if(err){console.log(err)}else{return done(err);}
					done();
			});
});

gulp.task('checkoutmaster', function(done) {
		
		try {
		process.chdir(modelroot);
		fs.accessSync('./.git');
		git.checkout('master',function(err){
			if (err)return done(err);
			done();
		});
		}catch(e){
			done();
		}
});

gulp.task('git',['checkout'])
