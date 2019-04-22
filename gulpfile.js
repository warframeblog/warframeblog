const path = require('path');
const gulp = require('gulp');
const rimraf = require('rimraf');
const sass = require('gulp-sass');
const shell = require('gulp-shell');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const uncss = require('uncss');
const through = require('through2');
const replace = require('gulp-replace');
const csso = require('csso');
const gulpIgnore = require('gulp-ignore');

const framePageStyles = 'static/assets/css/warframe-page';
const stylesSource = 'src/styles/**/*.scss';
const htmlSource = 'public/**/*.html';
const stylesDestDirectory = 'static/assets/css';

gulp.task('clean:styles', function (done) {
	rimraf.sync(framePageStyles);
	done();
});

gulp.task('styles', gulp.series('clean:styles', () => {
	return gulp.src(stylesSource)
		.pipe(sass({
			includePaths: ['node_modules', path.resolve('themes', 'hesti', 'src', 'css')]
		}).on('error', sass.logError))
		.pipe(postcss([ autoprefixer() ]))
		.pipe(rename(function(file) {
			if (file.basename === 'main') {
				file.basename = 'hesti';
			}
		}))
		.pipe(gulp.dest(stylesDestDirectory));	
}));

const siteRegex = /https:\/\/warframeblog\.com/g;

gulp.task('inject:styles', () => {
	let styles = '';
	return gulp.src(htmlSource)
		.pipe(gulpIgnore.include(function(vinylFile) {
			return /link rel="stylesheet"/.test(vinylFile.contents.toString());
		}))
		.pipe(through.obj((vinylFile, enc, cb) => {
			let transformedFile = vinylFile.clone();
			const htmlContent = transformedFile.contents.toString().replace(siteRegex, '');
			uncss(htmlContent, {htmlroot: 'public', ignore: [/.*\.ripple.*/, /.*\.dropdown-menu.*/, /.*\.show/, /.*\.toggled/, /.*\.nav-open.*/]}, function (error, output) {
				if(error) {
					console.log(`${error} - ${vinylFile.path}`);
					cb(error);
				}
				transformedFile.styles = csso.minify(output, { comments: false }).css;
				cb(null, transformedFile);
			})
		}))
		.pipe(replace(/\<\!-- inject\:styles --\>.+\<\!-- endinject --\>/ms, function() {
			console.log(`Injecting styles into ${this.file.path}`);
			return `<style>${this.file.styles}</style>`;
		})).on('error', console.log)
		.pipe(gulp.dest('public'));	
});

gulp.task('minify:markup', () => {
	return gulp.src(htmlSource)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('public'));
});

gulp.task('hugo:build', shell.task('hugo'));

gulp.task('build', gulp.series('styles', 'hugo:build', 'inject:styles', 'minify:markup'));

gulp.task('watch', () => {
	return gulp.watch(stylesSource, gulp.series('styles'));
});

gulp.task('default', gulp.parallel('watch', 'styles'));