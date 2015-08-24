function isDefined(a) {
    return typeof a !== 'undefined' && a !== null;
}

var sumoCookie = {
    write: function (name, value) {
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
    }
};

var sumoArticleDensity = (function () {
    var me = {
        density: {},
        densityHighest: {word: 'n/a', score: 0},
        body: null,
        stopWords: false,
        categories: {},
        articleCategory: {},
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
        setDensityHighest: function () {
            var d = this.density,
                self = this;

            Object.keys(d).forEach(function (k) {
                if (d[k] > self.densityHighest.score) {
                    self.densityHighest = {
                        word: k,
                        score: d[k]
                    }
                }
            });
        },
        removeStopWords: function () {
            var rep,
                body = this.body;

            this.stopWords.forEach(function (w) {
                rep = '\\s' + w + '\\s';
                body = body.replace(new RegExp(rep, 'gi'), ' ');
            });

            this.setDensity(body);
            this.setDensityHighest();
        },
        getStopWords: function (cb) {
            var self = this;

            if (!this.stopWords.length) {
                $.get('js/stop-words.json', function (response) {
                    self.stopWords = response;

                    self.removeStopWords();
                    cb(self.stopWords);
                });

                return false;
            }

            this.removeStopWords();
            cb(this.stopWords);
        },
        setArticleCategory: function () {
            var self = this,
                d = this.density,
                status = {};

            Object.keys(this.categories).forEach(function (c) {
                self.categories[c].forEach(function (cWord) {
                    Object.keys(d).forEach(function (dWord) {
                        if (cWord == dWord) {
                            if (!isDefined(status[c])) {
                                status[c] = 0;
                            }

                            status[c] += d[dWord];
                        }
                    });
                });
            });

            self.articleCategory = status;
        },
        getCategories: function (cb) {
            var self = this;

            if (!this.categories.length) {
                $.get('js/categories.json', function (response) {
                    self.categories = response;

                    self.setArticleCategory();
                    cb(self.categories);
                });

                return false;
            }

            this.setArticleCategory();
            cb(this.categories);
        },
        init: function (article, cb) {
            var self = this;

            this.setBody(article.title + ' ' + article.body);

            this.getStopWords(function () {
                self.getCategories(function () {
                    cb(self.articleCategory, self.densityHighest);
                });
            });
        }
    };

    return {
        init: function (article, cb) {
            me.init(article, cb);
        },
        highestCategory: function (obj) {
            var hc = 0, c = 'n/a';
            Object.keys(obj).forEach(function (k) {
                if (obj[k] > hc) {
                    c = k;
                }
            });

            return c;
        }
    }
})();

var sumoView = {
    addArticlesEvent: function () {
        var c = sumoCookie;

        $('li[id]').on('click', function () {
            var id = $(this).attr('id');

            c.write('article', id);

            location.href = 'page.html';
        });
    },
    loadArticles: function ($targetElement) {
        var c = sumoCookie,
            self = this;

        $.get('js/articles.json', function (r) {
            var articles = '';
            var viewed = c.read('viewed'),
                viewedList = [];

            if (isDefined(viewed)) {
                viewedList = JSON.parse(viewed);
            }

            r.forEach(function (a, i) {
                if ($.inArray(i.toString(), viewedList) == -1) {
                    articles += sumoView.getArticleHtml(a, i);
                }
            });

            $targetElement.html(articles);

            self.addArticlesEvent();
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
    var c = sumoCookie,
        v = sumoView,
        d = sumoArticleDensity;

    $('#getstarted').on('click', function () {
        location.href = $(this).data('href');
    });

    var onArticles = $('#articlesList');
    if (onArticles.length) {
        v.loadArticles(onArticles);
    }

    var onPage = $('#page');
    if (onPage.length) {
        var i = c.read('article');

        $.get('js/articles.json', function (r) {
            var overAll = c.read('overall'),
                article = r[i],
                viewedArticles = c.read('viewed');

            onPage.html(v.getArticleHtml(article, i, true));

            d.init(article, function (articleCategory, highestDensity) {
                if (!isDefined(overAll) || !isDefined(viewedArticles)) {
                    if (!isDefined(overAll)) {
                        c.write('overall', JSON.stringify(articleCategory));
                    }

                    if (!isDefined(viewedArticles)) {
                        viewedArticles = [i];
                        c.write('viewed', JSON.stringify(viewedArticles));
                    }

                    return false;
                }

                overAll = JSON.parse(overAll);
                viewedArticles = JSON.parse(viewedArticles);

                if ($.inArray(i.toString(), viewedArticles) == -1) {
                    // update over all
                    Object.keys(articleCategory).forEach(function (k) {
                        if (!isDefined(overAll[k])) {
                            overAll[k] = 0;
                        }

                        overAll[k] += articleCategory[k];
                    });
                    c.write('overall', JSON.stringify(overAll));

                    // update viewed
                    viewedArticles.push(i);
                    c.write('viewed', JSON.stringify(viewedArticles));
                }

                // when max of viewed
                if (viewedArticles.length >= 3) {
                    console.log(overAll);

                    $('.interestedIn').html('news about ' + d.highestCategory(overAll));
                    $('#article-overlay').slideDown();

                    return false;
                }
            });
        });
    }
});
window.intercomSettings = {
app_id: "mk6gdi4g"
};
(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',intercomSettings);}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/mk6gdi4g';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);}if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})()