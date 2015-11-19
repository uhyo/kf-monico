# KF66 Morning Call System
author: KF65syz

## 概要
KF66当日のモーニングコールを登録するシステムです。

## 技術詳細
サーバーサイドは当然のごとくnode.jsです。Webサーバーにexpressを使用するいつもの構成です。ただし、WebSocketサーバーも同居しています。

クライアント側はWebSocketでサーバーと通信しながら動作する構成で、UI周りはReactと、付随してrefluxjsというライブラリを使用しています。

## 開発方法
このアプリケーションはソースコードを直接実行できるものではなく、実際のnode.jsやブラウザ上で動作するJavaScriptコードに変換してから使用する必要があります。一般にこの作業をビルドと呼びます。
このアプリケーションでは、TypeScriptをJavaScriptに変換する、SassをCSSに変換する、requireなどを使って書かれたクライアントサイドのJavaScriptをbrowserifyで1つのJavaScriptコードにまとめる、という作業が必要です。
これらを、ソースコードを変更するたびにいちいちコマンドを叩いて行うのは面倒です。そこで、これを簡単に行えるようにするビルドツールを使っています。このアプリケーションはブルドツールの1つであるgulpを使用しています。ビルドの各段階はタスクと呼ばれ、gulpfile.jsで定義されています。これにより、npm install -g gulpとしてgulpをインストールしておいたのち、gulp defaultとすると全てのビルドが行われます。

ただ、ビルドはどうしても時間がかかるので、開発中に少しソースコードを変更して試したいときなど、毎回ビルドするのは面倒です。そこで、watchという機能により、ファイルに変更が加えられたらそこだけビルドしなおすことができるようになっています。これはgulp watchで起動します。開発中はずっとgulp watchを付けっぱなしにしておけば、ソースコードの変更がすぐ反映され、試すことができます。

## 設計
時間がなかったのでぐちゃぐちゃです。

