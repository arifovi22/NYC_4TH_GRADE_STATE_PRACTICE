// Debug-friendly loader for questions_grade4_extra.json
(function(){
  // Ensure global arrays exist so the loader doesn't crash if other scripts haven't run yet.
  window.elaQuestions = window.elaQuestions || [];
  window.scienceQuestions = window.scienceQuestions || [];

  // Provide a minimal fallback for makeShuffleBag used elsewhere so we don't get ReferenceError.
  window.makeShuffleBag = window.makeShuffleBag || function(n){
    var arr = [];
    for (var i = 0; i < n; i++) arr.push(i);
    return arr;
  };

  // Try multiple paths: relative (works when site is served from repo root),
  // then a repository-root absolute path (GitHub Pages), then site-root absolute.
  var paths = [
    'questions_grade4_extra.json',
    '/NYC_4TH_GRADE_STATE_PRACTICE/questions_grade4_extra.json',
    '/questions_grade4_extra.json'
  ];

  function tryLoad(index){
    if (index >= paths.length) {
      console.error('Quest loader: could not load questions_grade4_extra.json from any known path.');
      return;
    }
    var p = paths[index];
    console.log('Quest loader: attempting to fetch', p);

    fetch(p).then(function(res){
      if (!res.ok) {
        console.warn('Quest loader: fetch failed for', p, res.status, res.statusText);
        return tryLoad(index + 1);
      }
      return res.json().then(function(data){
        console.log('Quest loader: loaded data from', p, '—', Array.isArray(data) ? 'array' : 'object', data && data.length ? data.length : Object.keys(data || {}).length);

        // Support both legacy array format (plain array of ELA items) and
        // the newer object format { ela: [...], science: [...] }.
        if (Array.isArray(data)) {
          window.elaQuestions = window.elaQuestions.concat(data);
        } else {
          if (data.ela && Array.isArray(data.ela)) window.elaQuestions = window.elaQuestions.concat(data.ela);
          if (data.science && Array.isArray(data.science)) window.scienceQuestions = data.science;
        }

        try {
          window.nextElaQuestion = makeShuffleBag(window.elaQuestions.length);
        } catch (e) {
          console.warn('Quest loader: makeShuffleBag failed for ela', e);
          window.nextElaQuestion = [];
        }
        try {
          window.nextScienceQuestion = makeShuffleBag(Math.max(1, window.scienceQuestions.length));
        } catch (e) {
          console.warn('Quest loader: makeShuffleBag failed for science', e);
          window.nextScienceQuestion = [];
        }

        // If the app exposes a function to render/update the UI, call it.
        if (typeof window.renderNextQuestion === 'function') {
          try { window.renderNextQuestion(); } catch (e) { console.warn('Quest loader: renderNextQuestion errored', e); }
        }

      }).catch(function(err){
        console.error('Quest loader: JSON parse error for', p, err);
        tryLoad(index + 1);
      });
    }).catch(function(err){
      console.error('Quest loader: network error fetching', p, err);
      tryLoad(index + 1);
    });
  }

  tryLoad(0);
})();
