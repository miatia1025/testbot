# add, commit and push
git add .

$commit_msg = Read-Host "Commit message "

git commit -m $commit_msg
git push

# create commit url
$remote_url = git remote get-url origin
$commit_hash = git log -1 --pretty=format:%H
$commit_url = $remote_url -replace "\.git.*$", ""
$commit_url =  $commit_url + "/commit/" + $commit_hash

# show commit url
echo $commit_url