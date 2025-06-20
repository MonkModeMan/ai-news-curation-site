@echo off
echo [1] mainブランチに切り替え
git checkout main

echo [2] Astro ビルドを実行
cd astro-site
npm run build
cd ..

echo [3] dist の一時コピーを作成
rmdir /s /q dist-tmp
mkdir dist-tmp
xcopy /s /e /y astro-site\dist\* dist-tmp\

echo [4] gh-pages に切り替え
git checkout gh-pages

echo [5] 公開ディレクトリをクリーンアップして dist をコピー
del /f /q *.*
for /d %%i in (*) do rmdir /s /q "%%i"
xcopy /s /e /y dist-tmp\* .\

echo [6] Git にコミットして push
git add . -f
git commit -m "deploy from dist script"
git push origin gh-pages

echo 完了！
pause
