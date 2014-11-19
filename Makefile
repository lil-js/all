VERSION = 0.1.11
UGLIFYJS = ./node_modules/.bin/uglifyjs
BANNER = "/*! lil.js - v$(VERSION) - MIT License - https://github.com/lil-js/all */"

default: browser
browser: uglify
bundle: browser

uglify:
	$(UGLIFYJS) ./src/all.js ./bower_components/lil-http/http.js ./bower_components/lil-event/event.js ./bower_components/lil-uuid/uuid.js ./bower_components/lil-uri/uri.js ./bower_components/lil-type/type.js --beautify --preamble $(BANNER) > lil.js
	$(UGLIFYJS) lil.js --mangle --preamble $(BANNER) --source-map lil.min.js.map --source-map-url http://cdn.rawgit.com/lil-js/all/$(VERSION)/lil.min.js.map > lil.min.js

loc:
	wc -l lil.js

gzip:
	gzip -c lil.js | wc -c

publish: browser release
	git push --tags origin HEAD:master

