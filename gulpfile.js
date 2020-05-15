//assuming gulp is already installed globally
//npm init
//npm i gulp gulp-less gulp-autoprefixer gulp-cssnano gulp-rename --save-dev

const { src, dest, task, watch, parallel } = require('gulp');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

// compile the styles.less file into styles.min.css

const compileLess = function(cb) {
	return src('**/styles.less')
		.pipe(less())
		.pipe(autoprefixer({
			cascade: false
		}))
		.pipe(cssnano())
		.pipe(rename('styles.min.css'))
		.pipe(dest('./public/stylesheets'));
		cb();
}
compileLess.displayName = 'less';

// command: gulp less
task(compileLess);

task('doLess', function() {
	watch('**/**.less', function(cb) {
		return src('**/styles.less')
			.pipe(less())
			.pipe(
				autoprefixer({
					cascade: false,
				})
			)
			.pipe(cssnano())
			.pipe(rename('styles.min.css'))
			.pipe(dest('./public/stylesheets'));
		cb();
	});
});
// task('siteScripts', function() {
// 	watch('./development/scripts/main/**.js', function(cb) {
// 		return src([
// 			'node_modules/babel-polyfill/dist/polyfill.js',
// 			'./development/scripts/main/*.js',
// 		])
// 			.pipe(concat('scripts.js'))
// 			.pipe(babel({ presets: ['@babel/preset-env'] }))
// 			.pipe(dest('./public/scripts'))
// 			.pipe(rename('scripts.min.js'))
// 			.pipe(uglify())
// 			.pipe(dest('./public/scripts'));
// 		cb();
// 	});
// });
// task('vendorScripts', function() {
// 	watch('./development/scripts/vendor/**.js', function(cb) {
// 		return src(['./development/scripts/vendor/*.js'])
// 			.pipe(concat('vendor-scripts.js'))
// 			.pipe(dest('./public/scripts'))
// 			.pipe(rename('vendor-scripts.min.js'))
// 			.pipe(uglify())
// 			.pipe(dest('./public/scripts'));
// 		cb();
// 	});
// });
// task('doScripts', parallel('siteScripts', 'vendorScripts'));