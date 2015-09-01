var p = require('./package.json');
var gulp = require('gulp');
var gutil = require('gulp-util');
var colors = gutil.colors;
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify');
var beautify = require('gulp-js-beaut');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var cached = require('gulp-cached');
var util = require('util');
var path = require('path');
var del = require('del');
var gulpif = require('gulp-if');
var less = require('gulp-less');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var jade = require('gulp-jade');
var zip = require('gulp-zip');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var stylus = require('gulp-stylus');

var options = {
    "tasks": {
        "jade": {
            "enabled": true,
            "src": 'src/jade/**/*.jade',
            "dist": 'dist/',
            "cache": 'jade'
        },
        "less": {
            "enabled": false,
            "src": 'src/less/**/*.less',
            "dist": 'dist/css/',
            "cache": 'less'
        },
        "sass": {
            "enabled": true,
            "src": 'src/sass/**/*.sass',
            "dist": 'dist/css/',
            "cache": 'sass'
        },
        "scss": {
            "enabled": false,
            "src": 'src/scss/**/*.scss',
            "dist": 'dist/css/',
            "cache": 'scss'
        },
        "styl": {
            "enabled": false,
            "src": 'src/styl/**/*.styl',
            "dist": 'dist/css/',
            "cache": 'styl'
        },
        "coffee": {
            "enabled": true,
            "src": 'src/coffee/**/*.coffee',
            "dist": 'dist/js/',
            "cache": 'coffee'
        },
        "copy:html": {
            "enabled": true,
            "src": 'src/html/**/*.html',
            "dist": 'dist/',
            "cache": 'copy:html'
        },
        "copy:css": {
            "enabled": true,
            "src": 'src/css/**/*.css',
            "dist": 'dist/css/',
            "cache": 'copy:css'
        },
        "copy:js": {
            "enabled": true,
            "src": 'src/js/**/*.js',
            "dist": 'dist/js/',
            "cache": 'copy:js'
        },
        "copy:img": {
            "enabled": true,
            "src": 'src/img/**/*',
            "dist": 'dist/img/',
            "cache": 'copy:img'
        }
    },
    "env": "development"
};

function log(){
    var text = util.format.apply(null, arguments);
    gutil.log(text);
}


gulp.task('jade', function() {
    var o = options.tasks.jade;
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(jade({}))
        .pipe(gulpif(options.env !== 'production', beautify({})))
        .pipe(gulp.dest(o.dist));
});


gulp.task('less', function () {
    var o = options.tasks.less;
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(gulpif(options.env === 'production', minifyCSS()))
        .pipe(gulp.dest(o.dist));
});


gulp.task('sass', function() {
    var o = options.tasks.sass;
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(sass({indentedSyntax: true}))
        .on('error', gutil.log)
        .pipe(autoprefixer())
        .pipe(beautify({}))
        .pipe(gulpif(options.env === 'production', minifyCSS()))
        .pipe(gulp.dest(o.dist));
});


gulp.task('scss', function() {
    var o = options.tasks.scss;
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(sass({}))
        .on('error', gutil.log)
        .pipe(autoprefixer())
        .pipe(beautify({}))
        .pipe(gulpif(options.env === 'production', minifyCSS()))
        .pipe(gulp.dest(o.dist));
});

//stylus

gulp.task('styl', function() {
    var o = options.tasks.styl;
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(stylus())
        // .on('error', gutil.log)
        .pipe(autoprefixer())
        // .pipe(beautify({}))
        .pipe(gulpif(options.env === 'production', minifyCSS()))
        .pipe(gulp.dest(o.dist));
});

gulp.task('coffee', function() {
    var o = options.tasks.coffee;
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(coffee({}).on('error', gutil.log))
        .pipe(beautify({}))
        .pipe(gulpif(options.env === 'production', uglify()))
        .pipe(gulp.dest(o.dist));
});

gulp.task('copy:html', function() {
    var o = options.tasks['copy:html'];
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(gulpif(options.env === 'production', minifyHTML({
            comments: false,
            empty: true,
            quotes: true,
            conditionals: true,
            spare:true
        })))
        .pipe(gulp.dest(o.dist));
});

gulp.task('copy:css', function() {
    var o = options.tasks['copy:css'];
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(gulpif(options.env === 'production', minifyCSS()))
        .pipe(gulp.dest(o.dist));
});


gulp.task('copy:js', function() {
    var o = options.tasks['copy:js'];
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(gulpif(options.env === 'production', uglify()))
        .pipe(gulp.dest(o.dist));
});

gulp.task('copy:img', function() {
    var o = options.tasks['copy:img'];
    return gulp.src(o.src)
        .pipe(cached(o.cache))
        .pipe(gulpif(options.env === 'production', imagemin({
            progressive: true,
            // optimizationLevel: 3,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(o.dist));
});

gulp.task('clean', function(cb) {
    // del(['css/**/*.css', 'js/**/*.js', 'img/**/*'], cb);
    del(['dist/**/*'], cb);
});

gulp.task('zip', function() {
    return gulp.src('dist/**/*')
        .pipe(zip((p.name ? p.name : 'archive') + '.zip'))
        .pipe(gulp.dest('.'));
});

function watchFatory(srcPath, taskName, cacheName) {
    var watcher = gulp.watch(srcPath, [taskName]);
    watcher.on('change', function (event) {
        var relativePath = path.relative(path.resolve('.'), event.path);
        log("File %s was %s, running tasks...", colors.magenta(relativePath), colors.cyan(event.type));
        if (event.type === 'deleted') {
            try{
                delete cached.caches[cacheName][event.path];
            } catch(e) {}
        }
    });
}

gulp.task('watch', function () {
    for(var prop in options.tasks) {
        if(options.tasks.hasOwnProperty(prop) && options.tasks[prop] && options.tasks[prop].enabled) {
            var o = options.tasks[prop];
            watchFatory(o.src, prop, o.cache);
        }
    }
});

gulp.task('development', function () {
    options.env = "development";
});

gulp.task('production', function () {
    options.env = "production";
});

var tasks = [];

(function(){
    for(var prop in options.tasks) {
        if(options.tasks.hasOwnProperty(prop) && options.tasks[prop] && options.tasks[prop].enabled) {
            tasks.push(prop);
        }
    }
})();

gulp.task('default', ['watch'].concat(tasks));

gulp.task('compile', ['development'].concat(tasks));

gulp.task('build', ['production'].concat(tasks));