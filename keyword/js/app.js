function isDefined(a) {
    return typeof a !== 'undefined';
}

var sumoCookie = {
    create: function (name, value) {
        var expires = '', days = 365 * 100;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }

        document.cookie = name + "=" + value + expires + "; path=/";
    },
    read: function (name) {
        var nameEQ = name + "=", ca = document.cookie.split(';'), c, i;

        for (i = 0; i < ca.length; i++) {
            c = ca[i];

            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }

            if (c.indexOf(nameEQ) == 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }

        return null;
    },
    createMultiple: function (list) {
        var self = this;

        if (list instanceof Object) {
            Object.keys(list).forEach(function (key, val) {
                self.create(key, val);
            });
        }
    }
};

var sumoArticleDensity = (function () {
    var me = {
        density: {},
        highest: {word: 'n/a', density: 0},
        body: null,
        stopWords: false,
        setBody: function (body) {
            body = body.toLowerCase();
            body = body
                .replace(/[^a-z\s\']/gi, "")
                .replace(new RegExp('\\s+', 'gi'), ' ')
                .trim();

            this.body = body;
        },
        setDensity: function (body) {
            var self = this;

            body.split(' ').forEach(function (w) {
                if (!isDefined(self.density[w])) {
                    self.density[w] = 0;
                }

                self.density[w]++;
            });
        },
        setHighest: function () {
            var d = this.density,
                self = this;

            Object.keys(d).forEach(function (k) {
                if (d[k] > self.highest.density) {
                    self.highest = {
                        word: k,
                        density: d[k]
                    }
                }
            });
        },
        removeStopWords: function (cb) {
            var rep,
                body = this.body;

            this.stopWords.forEach(function (w) {
                rep = '\\s' + w + '\\s';
                body = body.replace(new RegExp(rep, 'gi'), ' ');
            });

            this.setDensity(body);
            this.setHighest();

            cb(this.density, this.highest);
        },
        getStopWords: function (cb) {
            var self = this;

            if (!this.stopWords) {
                $.get('js/stop-words.json', function (response) {
                    self.stopWords = response;

                    cb(response);
                });

                return false;
            }

            cb(this.stopWords);
        },
        init: function (article, cb) {
            var self = this;

            this.setBody(article.title + ' ' + article.body);

            this.getStopWords(function () {
                self.removeStopWords(cb);
            });
        }
    };

    return {
        init: function (article, cb) {
            me.init(article, cb);
        },
        density: function () {
            return me.density;
        },
        highest: function () {
            return me.highest;
        }
    }
})();

var sumoView = {
    loadArticles: function ($targetElement) {
        $.get('js/articles.json', function (r) {
            var articles = '';

            r.forEach(function (a, i) {
                articles += sumoView.getArticleHtml(a, i);
            });

            $targetElement.html(articles);

            $('li[id]').on('click', function () {
                sumoCookie.create('article', $(this).attr('id'));

                location.href = 'page.html';
            });
        });
    },
    getArticleHtml: function (article, index, full) {
        var body = article.body;
        full = full || false;

        if (!full) {
            body = body.substring(0, 200) + ' ...';
        }

        return '<li id="' + index + '"> ' +
            '<div class="listarticle-title">' + article.title + '</div> ' +
            '<div class="listarticle-location">by ' + article.site + '</div> ' +
            '<div class="listarticle-excerpt">' + body + '</div> ' +
            '</li>'
    }
};

$(document).ready(function () {
    $('#getstarted').on('click', function () {
        location.href = $(this).data('href');
    });

    var onArticles = $('#articlesList');
    if (onArticles.length) {
        sumoView.loadArticles(onArticles);
    }

    var onPage = $('#page');
    if (onPage.length) {
        var index = sumoCookie.read('article');
        $.get('js/articles.json', function (r) {
            var article = r[index];

            onPage.html(sumoView.getArticleHtml(article, index, true));

            sumoArticleDensity.init(article, function (density, highest) {
                $('.interestedIn').html('news about ' + highest.word.toUpperCase());
                $('#article-overlay').slideDown();

                console.log(density);
                console.log(highest);
            });
        });
    }
});
window.intercomSettings = {
app_id: "mk6gdi4g"
};
(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/mk6gdi4g';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()