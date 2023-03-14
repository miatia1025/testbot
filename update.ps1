git add .
$commit_msg = Read-Host "Commit message "
git commit -m $commit_msg
git push