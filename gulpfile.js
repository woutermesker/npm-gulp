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

//Options	
var wrapperOptions = {
        src: './source/umd-wrapper.tmpl'
    };

var tplCacheOptions = {
	module: 'forms-ui'
};

var gitformshome = 'https://remote.git';

//Environments to Generate
var jsFiles = ['DEV','SIT','UAT','PREPROD','LIVEPROVING','PROD' ];


var uglifyOptions = {
        preserveComments: 'some'
    };
	
	
gulp.task('Git tasks',[('clean'+jsFiles[i])], function() {
		git.clone(gitformshome, {args: './source/test'}, function (err) {
			  if (err) {
				console.log('clone not working');
			  }
		});

for (var i in jsFiles){
    (function(i) {
		gulp.task(('clean'+jsFiles[i]),  function () {
	         return del( ['target/'+jsFiles[i]+'/**']);
		});
	
        gulp.task(('moveFiles'+jsFiles[i]),[('clean'+jsFiles[i])], function() {
			return gulp.src(['./source/forms.home/**/*','!./source/forms.home/webresources/node_modules/**'])
				.pipe(gulp.dest('target/'+jsFiles[i]));
		});
			  
		gulp.task(('moveOnboardingPackage'+jsFiles[i]),[('moveFiles'+jsFiles[i])], function() {		
            return gulp.src('source/model/exports/Onboarding.project.zip')
                .pipe(gulp.dest('target/'+jsFiles[i]+'/exports/'));
		});
		
		gulp.task(('moveKeysProperties'+jsFiles[i]),[('moveOnboardingPackage'+jsFiles[i])], function() {		
			return gulp.src('source/model/keys.properties')
                .pipe(gulp.dest('target/'+jsFiles[i]));
        });
		
		gulp.task(('PackageJS'+jsFiles[i]),[('moveKeysProperties'+jsFiles[i])], function() {		
            return gulp.src(['./source/forms.home/webresources/interface/default/module.js',
							 './source/forms.home/webresources/interface/default/**/!(*spec).js'])
					.pipe(plumber())
					.pipe(sourcemaps.init())
					.pipe(ngAnnotate())
					.pipe(concat('forms-angular-ui.js'))
					.pipe(wrap(wrapperOptions))
					.pipe(gulp.dest('./target/'+jsFiles[i]+'/webresources/dist'))
					.pipe(rename('forms-angular-ui.min.js'))
					.pipe(uglify(uglifyOptions))
					.pipe(sourcemaps.write('.'))
					.pipe(gulp.dest('./target/'+jsFiles[i]+'/webresources/dist'));
        });
		
		gulp.task(('CompileLess'+jsFiles[i]),[('PackageJS'+jsFiles[i])], function () {
			return gulp.src('./source/forms.home/webresources/themes/default/base.less')
					.pipe(plumber())
					.pipe(sourcemaps.init())
					.pipe(compileLess())
					.pipe(sourcemaps.write())
					.pipe(rename('base.css'))
					.pipe(gulp.dest('./target/'+jsFiles[i]+'/webresources/themes/default/dist'));
		});
		
		gulp.task(('PackageHTMLTemplates'+jsFiles[i]),[('CompileLess'+jsFiles[i])], function () {
			return gulp.src('./source/forms.home/webresources/interface/default/**/*.html')
					.pipe(templateCache('forms-angular-ui.tpl.js', tplCacheOptions))
					.pipe(gulp.dest('./target/'+jsFiles[i]+'/webresources/dist'));
		});
				
		gulp.task(('unzipNodeModules'+jsFiles[i]),[('CreatePropertiesfiles:'+jsFiles[i]),('PackageHTMLTemplates'+jsFiles[i])], function () {
			 return gulp.src('target/'+jsFiles[i]+'/webresources/node_modules.zip')
					.pipe(unzip())
					.pipe(gulp.dest('target/'+jsFiles[i]+'/webresources/'));
        });
		
		gulp.task(('cleannodezip'+jsFiles[i]),[('unzipNodeModules'+jsFiles[i])], function () {
	         return del( ['target/'+jsFiles[i]+'/webresources/node_modules.zip']);
        });
		
		gulp.task(('zip'+jsFiles[i]),[('cleannodezip'+jsFiles[i])], function () {
	         return gulp.src('./target/'+jsFiles[i]+'/**')
					.pipe(zip(jsFiles[i]+'forms.home.zip'))
					.pipe(gulp.dest('./target/'+jsFiles[i]+'compressed'));
        });
    })(i);
}

		gulp.task('CreatePropertiesfiles:DEV', ['cleanDEV'], function(){
			 gulp.src('source/model/aquima.properties')
				.pipe(inject.replace('%ENDPOINTVAR%', variables.endpoints.SCT))
				.pipe(inject.replace('%DATABASEURL%', variables.databases.DEVURL))
				.pipe(inject.replace('%DATABASEUSER%', variables.databases.DEVUSER))
				.pipe(inject.replace('%DATABASEPASS%', variables.databases.DEVPASS))
				.pipe(gulp.dest('target/DEV'));
			 gulp.src('source/model/backbase.properties')
				.pipe(inject.replace('%ENVIRONMENTVAR%', variables.environmentvar.DEV))
				.pipe(inject.replace('%PHASE2%', variables.Phase2.DEV))
				.pipe(inject.replace('%OTPCONFIG%', variables.OTPconfig.DEV))
				.pipe(inject.replace('%VERSIONFRONT%', variables.frontendversion.DEV))
				.pipe(inject.replace('%VERSIONRUNT%', variables.runtimeversion.DEV))
				.pipe(gulp.dest('target/DEV'));
		});

		gulp.task('CreatePropertiesfiles:SIT',['cleanSIT'], function(){
			 gulp.src('source/model/aquima.properties')
				.pipe(inject.replace('%ENDPOINTVAR%', variables.endpoints.SCT))
				.pipe(inject.replace('%DATABASEURL%', variables.databases.SITURL))
				.pipe(inject.replace('%DATABASEUSER%', variables.databases.SITUSER))
				.pipe(inject.replace('%DATABASEPASS%', variables.databases.SITPASS))
				.pipe(gulp.dest('target/SIT'));
			 gulp.src('source/model/backbase.properties')
				.pipe(inject.replace('%ENVIRONMENTVAR%', variables.environmentvar.SIT))
				.pipe(inject.replace('%PHASE2%', variables.Phase2.SIT))
				.pipe(inject.replace('%OTPCONFIG%', variables.OTPconfig.SIT))
				.pipe(inject.replace('%VERSIONFRONT%', variables.frontendversion.SIT))
				.pipe(inject.replace('%VERSIONRUNT%', variables.runtimeversion.SIT))
				.pipe(gulp.dest('target/SIT'));
					  
		});

		gulp.task('CreatePropertiesfiles:UAT',['cleanUAT'], function(){
			 gulp.src('source/model/aquima.properties')
				.pipe(inject.replace('%ENDPOINTVAR%', variables.endpoints.MCT))
				.pipe(inject.replace('%DATABASEURL%', variables.databases.UATURL))
				.pipe(inject.replace('%DATABASEUSER%', variables.databases.UATUSER))
				.pipe(inject.replace('%DATABASEPASS%', variables.databases.UATPASS))
				.pipe(gulp.dest('target/UAT'));
			 gulp.src('source/model/backbase.properties')
				.pipe(inject.replace('%ENVIRONMENTVAR%', variables.environmentvar.UAT))
				.pipe(inject.replace('%PHASE2%', variables.Phase2.UAT))
				.pipe(inject.replace('%OTPCONFIG%', variables.OTPconfig.UAT))
				.pipe(inject.replace('%VERSIONFRONT%', variables.frontendversion.UAT))
				.pipe(inject.replace('%VERSIONRUNT%', variables.runtimeversion.UAT))
				.pipe(gulp.dest('target/UAT'));
					  
		});

		gulp.task('CreatePropertiesfiles:PREPROD',['cleanPREPROD'], function(){
			 gulp.src('source/model/aquima.properties')
				.pipe(inject.replace('%ENDPOINTVAR%', variables.endpoints.CERT))
				.pipe(inject.replace('%DATABASEURLG%', variables.databases.PREPRODURLG))
				.pipe(inject.replace('%DATABASEUSERG%', variables.databases.PREPRODUSERG))
				.pipe(inject.replace('%PREPRODPASSG%', variables.databases.PREPRODPASSG))
				.pipe(gulp.dest('target/PREPROD'));
			 gulp.src('source/model/backbase.properties')
				.pipe(inject.replace('%ENVIRONMENTVAR%', variables.environmentvar.PREPROD))
				.pipe(inject.replace('%PHASE2%', variables.Phase2.PREPROD))
				.pipe(inject.replace('%OTPCONFIG%', variables.OTPconfig.PREPROD))
				.pipe(inject.replace('%VERSIONFRONT%', variables.frontendversion.PREPROD))
				.pipe(inject.replace('%VERSIONRUNT%', variables.runtimeversion.PREPROD))
				.pipe(gulp.dest('target/PREPROD'));
					  
		});

		gulp.task('CreatePropertiesfiles:LIVEPROVING',['cleanLIVEPROVING'], function(){
			 gulp.src('source/model/aquima.properties')
				.pipe(inject.replace('%ENDPOINTVAR%', variables.endpoints.PROD))
				.pipe(inject.replace('%DATABASEURL%', variables.databases.LIVEPROVURL))
				.pipe(inject.replace('%DATABASEUSER%', variables.databases.LIVEPROVUSER))
				.pipe(inject.replace('%DATABASEPASS%', variables.databases.LIVEPROVPASS))
				.pipe(gulp.dest('target/LIVEPROVING'));
			 gulp.src('source/model/backbase.properties')
				.pipe(inject.replace('%ENVIRONMENTVAR%', variables.environmentvar.LIVEPROVING))
				.pipe(inject.replace('%PHASE2%', variables.Phase2.LIVEPROVING))
				.pipe(inject.replace('%OTPCONFIG%', variables.OTPconfig.LIVEPROVING))
				.pipe(inject.replace('%VERSIONFRONT%', variables.frontendversion.LIVEPROVING))
				.pipe(inject.replace('%VERSIONRUNT%', variables.runtimeversion.LIVEPROVING))
				.pipe(gulp.dest('target/LIVEPROVING'));
					  
		});

		gulp.task('CreatePropertiesfiles:PROD',['cleanPROD'], function(){
			 gulp.src('source/model/aquima.properties')
				.pipe(inject.replace('%ENDPOINTVAR%', variables.endpoints.PROD))
				.pipe(inject.replace('%DATABASEURL%', variables.databases.PRODURL))
				.pipe(inject.replace('%DATABASEUSER%', variables.databases.PRODUSER))
				.pipe(inject.replace('%DATABASEPASS%', variables.databases.PRODPASS))
				.pipe(gulp.dest('target/PROD'));
			 gulp.src('source/model/backbase.properties')
				.pipe(inject.replace('%ENVIRONMENTVAR%', variables.environmentvar.PROD))
				.pipe(inject.replace('%PHASE2%', variables.Phase2.PROD))
				.pipe(inject.replace('%OTPCONFIG%', variables.OTPconfig.PROD))
				.pipe(inject.replace('%VERSIONFRONT%', variables.frontendversion.PROD))
				.pipe(inject.replace('%VERSIONRUNT%', variables.runtimeversion.PROD))
				.pipe(gulp.dest('target/PROD'));
					  
		});
		
		
var SIT = ['CreatePropertiesfiles:SIT','SIT']
var SIT = ['CreatePropertiesfiles:SIT','SIT']
var UAT = ['CreatePropertiesfiles:UAT','UAT']
var PREPROD = ['PREPROD']
var LIVEPROVING = ['CreatePropertiesfiles:LIVEPROVING','LIVEPROVING']
var PROD = ['CreatePropertiesfiles:PROD','PROD']

gulp.task('dev', ['zipDEV'])
gulp.task('sit', ['zipSIT'])
gulp.task('uat', ['zipUAT'])
gulp.task('preprod', ['zipPREPROD'])
gulp.task('prod', ['zipPROD'])
gulp.task('help', taskListing)