var Loader = function(zipURL, callback) {

    var zipReader = null;
    var zipEntries = null;

    zip.createReader(new zip.HttpReader(zipURL), function(reader) {
        zipReader = reader; 
        zipReader.getEntries(function(entries) {
            zipEntries = entries;
            if (callback) callback();
        });
    }, onerror);

    function onerror(message) {
        console.error(message);
    }

    function getEntry(filename) {
        for (var i = 0, len = zipEntries.length; i < len; i++) {
            if (zipEntries[i].filename == filename) {
                return zipEntries[i];
            }
        }
        return null;
    }
    
    function appendChild(node, text) {
        if (null === node.canHaveChildren || node.canHaveChildren) {
            node.appendChild(document.createTextNode(text));
        } else {
            node.text = text;
        }
    }
    
    function getFileExtension(filename) {
        return (/[.]/.exec(filename)) && /[^.]+$/.exec(filename)[0] || '';
    }

    return {
        close : function() {
            zipReader.close(function() {
                zipReader = null;
            });
            zipEntries = null;
        },
    	loadImage : function(url, callback) {
    		var entry = getEntry(url);
            if (entry) {
                var mime = null;
                switch(getFileExtension(url).toLowerCase()) {
                    case 'gif' :
                        mime = "image/gif";
                        break;
                    case 'png' :
                        mime = "image/png";
                        break;
                    case 'jpg':
                    case 'jpeg':
                        mime = "image/jpeg";
                        break;
                }
                if (mime != null) {
                    entry.getData(new zip.Data64URIWriter(mime), function(data) {
                	    callback(data);
                    });
                }
            }
        },
        loadCSS : function(url, callback) {
            var entry = getEntry(url);
            if (entry) {
            	entry.getData(new zip.TextWriter(), function(data) {
                var pa= document.getElementsByTagName('head')[0];
                var el= document.createElement('style');
                el.type= 'text/css';
                el.media= 'screen';
                if(el.styleSheet) el.styleSheet.cssText = data;// IE method
                else el.appendChild(document.createTextNode(data));// others
                pa.appendChild(el);
                if (callback) callback();
            	});
            }
        },
        loadScript : function(url, callback, encoding) {
        	var entry = getEntry(url);

            if (entry) {
            	entry.getData(new zip.TextWriter(), function(data) {
                var fileRef = window.document.createElement("script");
                fileRef.setAttribute("type", "text/javascript");
    		    fileRef.setAttribute("charset", encoding);

                var head = document.getElementsByTagName("head")[0] || document.documentElement;
                head.insertBefore(fileRef, head.firstChild);
                appendChild(fileRef, data);
                if (callback) callback();
            	});
            }
        }
    }


};
