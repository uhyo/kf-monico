"use strict";
var path=require('path');
var gulp=require('gulp');
var gulputil=require('gulp-util');

const webpack = require('webpack');

var source=require('vinyl-source-stream');
var typescript=require('gulp-typescript');
var ts=require('typescript');
var del=require('del');
var sass=require('gulp-sass');
var duration=require('gulp-duration');
var changed=require('gulp-changed');
var rename=require('gulp-rename');
var runSequence=require('run-sequence');

const clientTsProject = typescript.createProject('tsconfig.json', {
    typescript: ts,
    module: 'es2015',
});
const serverTsProject = typescript.createProject('tsconfig.json', {
    typescript: ts,
});

gulp.task('tsc',()=>{
    return gulp.src("server/**/*.ts")
    .pipe(serverTsProject())
    .js
    .pipe(gulp.dest("js/"));
});
gulp.task('watch-tsc', ['tsc'], ()=>{
    gulp.watch(['server/**/*.ts'], ['tsc']);
});
gulp.task('client-tsc',()=>{
    return gulp.src("client/**/*.{ts,tsx}")
    .pipe(clientTsProject())
    .js
    .pipe(gulp.dest("dest/"));
});
gulp.task('watch-client-tsc', ['client-tsc'], ()=>{
    gulp.watch(['client/**/*.{ts,tsx}'], ['client-tsc']);
});
gulp.task('bundle', ['client-tsc'], ()=>{
    return bundler(false);
});
gulp.task('watch-bundle', ['watch-client-tsc'], ()=>{
    return bundler(true);
});
gulp.task('sass',()=>{
    return gulp.src("client/sass/index.scss")
    .pipe(sass().on("error",sass.logError))
    .pipe(rename("css.css"))
    .pipe(gulp.dest("dist"));
});

gulp.task('static',function(){
    return gulp.src(["client/static/**/*"],{
        base:"client/static"
    })
    .pipe(changed("dist/"))
    .pipe(gulp.dest("dist/"));
});

gulp.task('clean',(cb)=>{
    del([
        "js",
        "server/**/*.js",
        "dest",
        "dist",
    ],cb);
});

gulp.task('watch',['watch-client-tsc','watch-tsc','watch-bundle','sass'],()=>{
    gulp.watch('client/sass/**/*.scss',['sass']);
});

gulp.task('default',['tsc','client-tsc','bundle','sass','static']);

function bundler(watch){
  const compiler = webpack(require('./webpack.config.js'));

  const handleStats = (stats, watch)=>{
      console.log(stats.toString({
          chunks: !watch,
          colors: true,
      }));
  };
  if (watch){
      return compiler.watch({
      }, (err, stats)=>{
          if (err){
              console.error(err);
              return;
          }
          handleStats(stats, true);
      });
  }else{
      return compiler.run((err, stats)=>{
          if (err){
              console.error(err);
              return;
          }
          handleStats(stats, false);
      });
  }
}
