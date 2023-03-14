git add .

$commit_msg = Read-Host "Commit message "

git commit -m $commit_msg
git push

$remote_url = git remote get-url origin
$commit_hash = git log -1 --pretty=format:%H
$commit_url = $remote_url.TrimEnd('.git') + "/commit/" + $commit_hash
echo $commit_url