fetch('questions_grade4_extra.json')
  .then(function(r){ if(!r.ok) throw new Error('no extras'); return r.json(); })
  .then(function(data){
      // Support both legacy array format (plain array of ELA items) and
      // the newer object format { ela: [...], science: [...] }.
      if (Array.isArray(data)) {
          // Legacy: merge array into ELA questions
          elaQuestions = elaQuestions.concat(data);
      } else {
          if (data.ela && Array.isArray(data.ela)) {
              elaQuestions = elaQuestions.concat(data.ela);
          }
          if (data.science && Array.isArray(data.science)) {
              scienceQuestions = data.science;
          }
      }
      nextElaQuestion = makeShuffleBag(elaQuestions.length);
      nextScienceQuestion = makeShuffleBag(Math.max(1, scienceQuestions.length));
  })
  .catch(function(){ /* no extras available — silent fallback */ });
