cd ~/programming/dpzmick.com/whichone
git pull
cd ..
git add whichone
git commit -m "updated which one for deploy at `date`"
git push
rake publish
