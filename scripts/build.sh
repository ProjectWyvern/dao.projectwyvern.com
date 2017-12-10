#!/bin/sh

yarn run poi build
mv dist/* docs
echo 'dao.projectwyvern.com' > docs/CNAME
rmdir dist
