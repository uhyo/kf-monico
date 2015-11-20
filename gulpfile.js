"use strict";
var path=require('path');
var gulp=require('gulp');
var gulputil=require('gulp-util');
var browserify=require('browserify');
var source=require('vinyl-source-stream');
var babelify=require('babelify');
var uglifyify=require('uglifyify');
var watchify=require('watchify');
var typescript=require('gulp-typescript');
var ts=require('typescript');
var del=require('del');
var sass=require('gulp-sass');
var duration=require('gulp-duration');
var changed=require('gulp-changed');
var rename=require('gulp-rename');
var runSequence=require('run-sequence');

gulp.task('tsc',()=>{
    return gulp.src("server/**/*.ts")
    .pipe(typescript({
        module:"commonjs",
        target:"es5",
        typescript:ts
    }))
    .js
    .pipe(gulp.dest("js/"));
});
gulp.task('tsx-tsc',()=>{
    return gulp.src("client/**/*.{ts,tsx}")
    .pipe(typescript({
        module:"commonjs",
        target:"es5",
        jsx:"react",
        typescript:ts
    }))
    .js
    .pipe(gulp.dest("dest/"));
});
gulp.task('jsx',()=>{
    return browserifier(false);
});
gulp.task('watch-jsx',()=>{
    return browserifier(true);
});
gulp.task('tsx',(callback)=>{
    return runSequence(
        'tsx-tsc',
        'jsx',
        callback
    );
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

gulp.task('clean',()=>{
    del([
        "js",
        "server/**/*.js",
        "dest",
        "dist",
    ],cb);
});

gulp.task('watch',['tsx-tsc','watch-jsx','tsc','sass'],()=>{
    gulp.watch('server/**/*.ts',['tsc']);
    gulp.watch('client/**/*.{ts,tsx}',['tsx-tsc']);
    gulp.watch('client/sass/**/*.scss',['sass']);
});

gulp.task('default',['tsx','tsc','sass','static']);

function browserifier(watch){
    let opts={
        entries:[path.join(__dirname,"dest/tsx/entrypoint.js")],
        extensions:['.js'],
        basedir:__dirname
    };
    if(watch){
        opts.cache={};
        opts.packageCache={};
        opts.fullPaths=true;
    }
    let b=browserify(opts);
    if(watch){
        b=watchify(b);
    }
    b
    //.transform(babelify)
    .transform(uglifyify,{global:true})
    .on('update',bundle);
    bundle();

    function bundle(){
        gulputil.log('recompiling jsx');

        b
        .bundle()
        .on('error',function(err){
            console.error(err);
        })
        .pipe(duration("compiled jsx"))
        .pipe(source("components.js"))
        .pipe(gulp.dest("dist/"));
    }
}
