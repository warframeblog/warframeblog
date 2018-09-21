const gulp = require('gulp');
const rimraf = require('rimraf');
const sass = require('gulp-sass');
const shell = require('gulp-shell');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const nodeSassMagicImporter = require('node-sass-magic-importer');

const framePageStyles = 'static/assets/css/warframe-page';
const stylesSource = 'src/styles/**/*.scss';
const stylesDestDirectory = 'static/assets/css';

gulp.task('clean:styles', function (done) {
	rimraf.sync(framePageStyles);
	done();
});

gulp.task('styles', gulp.series('clean:styles', () => {
	return gulp.src(stylesSource)
		.pipe(sass({
			includePaths: ['node_modules'],
			importer: nodeSassMagicImporter(),
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(stylesDestDirectory));	
}));

gulp.task('minify:markup', () => {
	return gulp.src('public/**/*.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('public'));
});

gulp.task('hugo:build', shell.task('hugo'));

gulp.task('build', gulp.series('styles', 'hugo:build', 'minify:markup'));

gulp.task('watch', () => {
	return gulp.watch(stylesSource, gulp.series('styles'));
});

gulp.task('default', gulp.parallel('watch', 'styles'));