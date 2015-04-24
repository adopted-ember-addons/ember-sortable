demo:
	@echo ""
	@echo "===> Checking out gh-pages"
	@echo ""
	git checkout gh-pages
	git reset --hard master
	@echo ""
	@echo "===> Building demo"
	@echo ""
	ember build -e production -o demo
	@echo ""
	@echo "===> Committing demo"
	@echo ""
	git add demo
	git commit -m "Build demo"
	@echo ""
	@echo "===> Pushing gh-pages"
	@echo ""
	git push origin gh-pages -f
	@echo ""
	@echo "===> Cleaning up"
	@echo ""
	git checkout master
	rm -rf demo
