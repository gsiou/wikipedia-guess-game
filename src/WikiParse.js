export function fetchArticles() {
    return new Promise(function(resolve, reject) {

        getRandom().then(function (fullarticle) {
            var links = extractLinks(fullarticle);
            // Get the topic to be questioned
            do {
                var random_link_index = randomInt(0, links.length);
                var target_link_obj = links[random_link_index];
            } while(target_link_obj.ns !== 0);

            // Find related link
            getRelated(target_link_obj, random_link_index, links).then(function(result) {
                //console.log("ARTICLE 1: " + getTitle(fullarticle));
                //console.log("ARTICLE 2: " + getTitle(result));
                //console.log("TARGET: " + target_link_obj.title);
                resolve({
                    "article1": getTitle(fullarticle),
                    "article2": getTitle(result),
                    "target": target_link_obj.title
                });
            })
        });
    });
}

function getRandom(){
    //console.log("Inside get random");
    return new Promise(function(resolve, reject) {
        var random_article_promise = fetchFromWiki(
            'action=query&grnlimit=1&generator=random&grnnamespace=0&format=json&origin=*'
        );

        random_article_promise.then(function(article) {
            var articleobj = JSON.parse(article);
            var pages = articleobj.query.pages;
            var pageid = pages[(Object.keys(pages)[0])].pageid

            fetchFromWiki(
                'action=query&prop=links&pllimit=max&format=json&pageids=' + pageid +'&origin=*'
            ).then(function(article){
                if(extractLinks(article) === undefined){
                    // Proooobably bad
                    resolve(getRandom());
                }
                else{
                    resolve(article);
                }
            });
        });
    });
}


function getRelated(target_link_obj, random_link_index, links) {
    //console.log("Inside get related");
    return new Promise(function(resolve, reject) {
        do {
            var second_article_index = randomInt(0, links.length);
        } while(second_article_index === random_link_index || links[second_article_index].ns !== 0);

        // Get articles links
        fetchFromWiki(
            'action=query&prop=links&pllimit=max&format=json&titles=' + links[second_article_index].title +'&origin=*'
        ).then(function(second_article) {
            var second_links = extractLinks(second_article);
            if(second_links === undefined){
                // Proooobably bad
                resolve(getRelated(target_link_obj, random_link_index, links));
            }
            else{
                var unique = true;
                for(var i = 0; i < second_links.length; i++) {
                    if(second_links[i].title === target_link_obj.title){
                        unique = false;
                        break;
                    }
                }
                if(unique){
                    resolve(second_article);
                }
                else{
                    // The following seems very not supposed to be like this
                    // but it seems to work for now.
                    resolve(getRelated(target_link_obj, random_link_index, links));
                }
            }
        });
    });
}


function fetchFromWiki(url) {
  return new Promise(function (resolve, reject){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://en.wikipedia.org/w/api.php?' + url, true);
    xhr.setRequestHeader('Api-User-Agent', 'Wikipedia-guess-game/1.0 (dr.george995@gmail.com) ');
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(null);

    xhr.onreadystatechange = function() {
      var DONE = 4;
      var OK = 200;
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          resolve(xhr.responseText);
        }
        else {
          reject(xhr.status);
        }
      }
    }
  });
}

function extractLinks(article) {
  var articleobj = JSON.parse(article);
  //console.log(articleobj);
  var pages = articleobj.query.pages;
  var links = pages[Object.keys(pages)[0]].links;
  return links;
}

function getTitle(article) {
    var articleobj = JSON.parse(article);
    var pages = articleobj.query.pages;
    return pages[Object.keys(pages)[0]].title;
}

function fetchLinksOfArticle(title){

}

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
