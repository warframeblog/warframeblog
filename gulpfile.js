const gulp = require('gulp');
const rimraf = require('rimraf');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const nodeSassMagicImporter = require('node-sass-magic-importer');

const stylesDestDirectory = 'themes/warframe/static/assets/css';
const stylesSource = 'themes/warframe/src/scss/**/*.scss';

gulp.task('clean:styles', () => {
	rimraf.sync(stylesDestDirectory)
});

gulp.task('styles', ['clean:styles'], () => {
	gulp.src(stylesSource)
		.pipe(sass({
			includePaths: ['node_modules'],
			importer: nodeSassMagicImporter(),
			// outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(stylesDestDirectory));
});

gulp.task('minify:markup', () => {
	gulp.src('public/**/*.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('public'));
});

gulp.task('build', ['styles', 'minify:markup']);

gulp.task('watch', () => {
	gulp.watch(stylesSource, ['styles']);
});

gulp.task('default', ['watch', 'styles']);