
var apikey = "";
var userlevel=0;

var vocab;
var vocabInfo;
var hintSentences=[];
var audioBuffers = [];
var answers=[];


async function wanikaniApiCall(apikey, endpoint,params) {
  const wanikaniurl = 'https://api.wanikani.com/v2/';
  var url = wanikaniurl + endpoint + params;
  console.log(url);
  var output=null;
  do{

    var responce = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apikey}`
      }
    }).then(response => response.json()).catch(error => { console.error('Error:', error); });
    if(output==null){
      output=responce;
    }else{
      output.data=output.data.concat(responce.data);
    }
    if(responce.pages!=null){
      url=responce.pages.next_url;
    }else{
      url=null;
    }
  }while(url!=null);
  console.log("output:");
  console.log(output);
  return output;
}




document.getElementById('api-form').addEventListener('submit', async function(event) {

    event.preventDefault();
    
    apiKey = document.getElementById('api-key').value;
    
    var data = await wanikaniApiCall(apiKey, 'user', '')
    userlevel=data.data.level;
    console.log(data);
    console.log(userlevel);
 
    var params = "?subject_types=vocabulary,kana_vocabulary&levels=1";
    console.log(userlevel);
    for (var i = 2; i <= userlevel; i++) {
        

        params += ","+i
    }
    params += "&srs_stages=5,6,7,8,9";

    wanikaniApiCall(apiKey, 'assignments', params).then(data => {
        vocab = data.data;
        console.log(vocab);
        initData();
    });

    document.getElementById('api-form').hidden = true;
    document.getElementById('grid-container').style.display = "table";
});





async function initData() {


  newVocab();

 document.getElementById("audio").addEventListener("click", function() {
    
    playAudio();


  });



}

async function newVocab() {

  var vocabIndex = Math.floor(Math.random() * vocab.length);
  var vocabItem = vocab[vocabIndex];
  console.log(vocabItem);
  var vocabData = vocabItem.data;
  var vocabId = vocabData.subject_id;

  vocabInfo = (await wanikaniApiCall(apiKey, 'subjects',"?ids="+vocabId)).data[0].data;
  console.log(vocabInfo);

  for (var i = 0; i < vocabInfo.meanings.length; i++) {
    answers =answers.concat(vocabInfo.meanings[i].meaning);
  }

  for (var i = 0; i < vocabInfo.auxiliary_meanings.length; i++) {
    if(vocabInfo.auxiliary_meanings[i].type!="whitelist"){
      continue;
    }
    answers =answers.concat(vocabInfo.auxiliary_meanings[i].meaning);
  }

  for (var i = 0; i < vocabInfo.context_sentences.length; i++) {
    hintSentences =hintSentences.concat(vocabInfo.context_sentences[i].ja);
  }

  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext(); // Make it crossbrowser
  var gainNode = context.createGain();
  gainNode.gain.value = 1;

  for(var i=0;i<vocabInfo.pronunciation_audios.length;i++){
    var audio_url = vocabInfo.pronunciation_audios[i].url;
    await window.fetch(audio_url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer,
         audioBuffer => {
            audioBuffers = audioBuffers.concat(audioBuffer);
          },
          error =>
            console.error(error)
        ))
  }
  console.log(hintSentences);

  function unlock() {
    console.log("unlocking")
    // create empty buffer and play it
    var buffer = context.createBuffer(1, 1, 22050);
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);

    // play the file. noteOn is the older version of start()
    source.start ? source.start(0) : source.noteOn(0);

    // by checking the play state after some time, we know if we're really unlocked
    setTimeout(function() {
      if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
        // Hide the unmute button if the context is unlocked.        unmute.style.display = "none";
        console.log("sassa");
      }
    }, 0);
  }

  // Try to unlock, so the unmute is hidden when not necessary (in most browsers).
  unlock();

}


function playAudio() {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext(); // Make it crossbrowser
  var gainNode = context.createGain();
  gainNode.gain.value = 1;
  var source = context.createBufferSource();
      source.buffer = audioBuffers[Math.floor(Math.random() * audioBuffers.length)];
      source.connect(context.destination);
      console.log("playing audio");
      console.log(source.start());
}


    /*
(function () {

  // Check if the browser supports web audio. Safari wants a prefix.
  if ('AudioContext' in window || 'webkitAudioContext' in window) {

    //////////////////////////////////////////////////
    // Here's the part for just playing an audio file.
    //////////////////////////////////////////////////
    var play = function play(audioBuffer) {
      var source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.start();
    };

    var URL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/Yodel_Sound_Effect.mp3';
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext(); // Make it crossbrowser
    var gainNode = context.createGain();
    gainNode.gain.value = 1; // set volume to 100%
    var playButton = document.querySelector('#play');
    var yodelBuffer = void 0;

    // The Promise-based syntax for BaseAudioContext.decodeAudioData() is not supported in Safari(Webkit).
    window.fetch(URL)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer,
         audioBuffer => {
            yodelBuffer = audioBuffer;
          },
          error =>
            console.error(error)
        ))

    playButton.onclick = function () {
      return play(yodelBuffer);
    };

    // Play the file every 2 seconds. You won't hear it in iOS until the audio context is unlocked.
    window.setInterval(function(){
      play(yodelBuffer);
    }, 5000);


    //////////////////////////////////////////////////
    // Here's the part for unlocking the audio context, probably for iOS only
    //////////////////////////////////////////////////

    // From https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
    // "The only way to unmute the Web Audio context is to call noteOn() right after a user interaction. This can be a click or any of the touch events (AFAIK – I only tested click and touchstart)."
    
    var unmute = document.getElementById('unmute');
    unmute.addEventListener('click', unlock);

    function unlock() {
      console.log("unlocking")
      // create empty buffer and play it
      var buffer = context.createBuffer(1, 1, 22050);
      var source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);

      // play the file. noteOn is the older version of start()
      source.start ? source.start(0) : source.noteOn(0);

      // by checking the play state after some time, we know if we're really unlocked
      setTimeout(function() {
        if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
          // Hide the unmute button if the context is unlocked.
          unmute.style.display = "none";
        }
      }, 0);
    }

    // Try to unlock, so the unmute is hidden when not necessary (in most browsers).
    unlock();
  }
}
)();*/