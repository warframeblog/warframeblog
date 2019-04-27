const path = require('path');
const gulp = require('gulp');
const rimraf = require('rimraf');
const sass = require('gulp-sass');
const shell = require('gulp-shell');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const uncss = require('postcss-uncss');
const through = require('through2');
const replace = require('gulp-replace');
const csso = require('postcss-csso');
const gulpIgnore = require('gulp-ignore');

const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const cjs = require('rollup-plugin-commonjs');

const scssFiles = 'src/styles/**/*.scss';
const themeScssFiles = 'themes/hesti/src/css/**/*.scss';
const styleAssets = 'static/assets/css';
const htmlFilesToPublish = 'public/**/*.html';
const styleFilesToPublish = 'public/assets/css/**/*.css';
const publicStyleAssets = 'public/assets/css';

gulp.task('scripts', () => {
	const babelOpts = {
      externalHelpersWhitelist: [
        'defineProperties',
        'createClass',
        'inheritsLoose',
        'extends',
      ],
    };
	const cjsOpts = {
		include: ['node_modules/bootstrap/**', 'node_modules/bootstrap-material-design/**', 'node_modules/jquery/**'],
		namedExports: {
			'node_modules/jquery/dist/jquery.js': 'jquery',
		}
	};
	return gulp.src('src/js/index.js')
		.pipe(rollup({  
			external: ['jquery', 'popper.js'],
			output: { 
				globals: { 'jquery': 'jQuery', 'popper.js' : 'Popper' }
			},
			plugins: [babel(babelOpts), resolve(), cjs(cjsOpts)] 
		}, 'umd'))
		.pipe(gulp.dest('static/assets/js'));
});

gulp.task('build:styles', () => {
	return gulp.src(scssFiles)
		.pipe(sass({
			includePaths: ['node_modules', path.resolve('themes', 'hesti', 'src', 'css')]
		}).on('error', sass.logError))
		.pipe(rename(function(file) {
			if (file.basename === 'main') {
				file.basename = 'hesti';
			}
		}))
		.pipe(gulp.dest(styleAssets));	
});

gulp.task('minify:styles', () => {
	return gulp.src(styleFilesToPublish)
		.pipe(postcss([uncss({htmlroot: 'public', html: ['public/**/*.html'], ignore: [/.*\.ripple.*/, /.*\.dropdown-menu.*/, /.*\.show/, /.*\.toggled/, /.*\.nav-open.*/]})]))
		.pipe(postcss([ autoprefixer(), csso({ comments: false }) ]))
		.pipe(gulp.dest(publicStyleAssets))
});

gulp.task('replace:html', () => {
	return gulp.src(htmlFilesToPublish)
		.pipe(replace('https://warframeblog.com/assets/', '/assets/'))
		.pipe(gulp.dest('public'));
});

gulp.task('minify:html', () => {
	return gulp.src(htmlFilesToPublish)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('public'));
});

gulp.task('build:hugo', shell.task('hugo'));

gulp.task('build', gulp.series('build:styles', 'build:hugo', 'replace:html', 'minify:styles', 'minify:html'));

gulp.task('watch', () => {
	return gulp.watch([scssFiles, themeScssFiles], gulp.series('build:styles'));
});

gulp.task('default', gulp.parallel('watch', 'build:styles'));