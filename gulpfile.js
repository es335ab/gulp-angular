var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var nib         = require('nib');
var merge       = require('merge-stream');
var runSequence = require('run-sequence');
var saveLicense = require('uglify-save-license');
//var spritesmith = require('gulp.spritesmith');
var svgSprites  = require("gulp-svg-sprites");
var filter      = require('gulp-filter');
var svg2png     = require('gulp-svg2png');
var browserSync = require('browser-sync');
var proxy       = require('proxy-middleware');
var url         = require('url');
var styledown   = require('gulp-styledown');
var reload      = browserSync.reload;

var path = {
  assets: 'assets',
  tmp: '.tmp',
  build: 'build'
};

gulp.task('styledown', function () {
  return gulp.src([path.assets + '/stylus/**/*.styl'])
    .pipe(styledown({
      filename: '_styleguide.html',
      config: path.assets + '/stylus/styledownConfig.md'
    }))
    .pipe(gulp.dest(path.tmp));
});

gulp.task('svgSprite', function () {
  return gulp.src(path.assets + '/img/svgSprites/*.svg')
    .pipe(svgSprites({
      cssFile: '../' + path.assets + '/stylus/var/_sprite.styl',
      padding: 8,
      common: 'spr',
      selector: 'spr-%f',
      layout: 'vertical',//binary-tree で配置したいが対応していない
      preview: {
        sprite: '_sprite.html'
      },
      svg: {
        sprite: 'img/svgSprite.svg'
      }
    }))
    .pipe(gulp.dest(path.tmp));
    // pngが生成されないので一旦コメントアウト
    // .pipe(filter(path.assets + '/img/svgSprites/*.svg'))
    // .pipe(svg2png())
    // .pipe(gulp.dest(path.tmp));
});

gulp.task('js:common', function() {
  var assets = $.useref.assets();
  var nonVendor = 'js/**/*.js';
  return gulp.src([
      path.assets + '/index.html'
    ])
    .pipe(assets)
    .pipe($.if(nonVendor, $.ngmin()))
    // .pipe($.if('*.js', $.uglify({
    //   mangle: false,
    //   preserveComments: saveLicense
    // })))
    // .pipe($.if('*.css', $.autoprefixer('last 2 versions')))
    // .pipe($.if('*.css', $.minifyCss()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest(path.tmp))
    .pipe(reload({stream:true}));
});

gulp.task('stylus', function() {
  return gulp.src(path.assets+'/stylus/*.styl')
    .pipe($.plumber({errorHandler: $.notify.onError('<%= error.message %>')}))
    .pipe($.stylus({
      use: nib()
    }))
    .pipe($.pleeease())
    .pipe(gulp.dest(path.tmp+'/css'))
    .pipe(reload({stream:true}));
});

// pngでspriteする場合
gulp.task('sprite', function() {
  var spriteData = gulp.src(path.assets+'/img/sprites/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite.styl',
    imgPath: '../img/sprite.png',
    cssFormat: 'stylus'
  }));
  return merge(
    spriteData.img.pipe(gulp.dest(path.tmp+'/img')),
    spriteData.css.pipe(gulp.dest(path.assets+'/stylus/var'))
  );
});

gulp.task('jshint', function() {
  return gulp.src(path.assets+'/js/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('uglify', function() {
  return gulp.src(path.tmp+'/js/**/*.js')
    .pipe($.uglify({
      preserveComments: saveLicense
    }))
    .pipe(gulp.dest(path.build+'/js'));
});

gulp.task('copy:tmp', function() {
  return gulp.src([
      path.assets+'/**/*.!(styl|md)',
      '!'+path.assets+'/index.html',
      '!'+path.assets+'/js/utils/**/*.js',
      '!'+path.assets+'/img/sprites/**',
      '!'+path.assets+'/img/svgSprites/**'
    ])
    .pipe(gulp.dest(path.tmp));
});

gulp.task('clean:tmp', function() {
  return gulp.src(path.tmp, {read: false})
    .pipe($.clean());
});

gulp.task('watch', ['browser-sync'], function() {
  gulp.watch(path.assets+'**/*.html', ['js:common', 'copy:tmp']);
  gulp.watch(path.assets+'/js/utils/**/*.js', ['js:common']);
  gulp.watch(path.assets+'/js/pages/**/*.js', ['copy:tmp']);
  gulp.watch(path.assets+'/stylus/**/*.styl', ['stylus', 'styledown']);
});

gulp.task('browser-sync', function() {
  var proxyOptions = url.parse('http://localhost:8080/api');
  proxyOptions.route = '/api';

  browserSync({
    port: 3000,
    server: {
      baseDir: path.tmp,
      middleware: [proxy(proxyOptions)]
    }
  });
});

gulp.task('server', function() {
  runSequence(
    'clean:tmp',
    'svgSprite',
    ['copy:tmp', 'stylus', 'styledown'],
    'js:common',
    'watch'
  );
});