window.addEventListener('load', function() {
	if (typeof speechSynthesis == 'undefined' || typeof webkitSpeechRecognition == 'undefined')
		return alert('Only Chrome browser is supported');

	var $success = new Audio('correct.mp3');
	var $tada = new Audio('tada.mp3');	
	
	var $button = document.querySelector('#page-card #button');	
	var $image = document.querySelector('#page-card #image');
	var $word = document.querySelector('#page-card #word');
	var $translate = document.querySelector('#page-card #translate');
	var $answer = document.querySelector('#page-card #answer');
	
	$image.addEventListener('click', e => speakText($word.textContent));
				
	var voice;
	loadVoices();
	if (speechSynthesis.onvoiceschanged !== undefined) 
		speechSynthesis.onvoiceschanged = () => loadVoices();	
	

	var group, cardNo;
	document.querySelectorAll('#page-selector .group').forEach(function ($e) {
		$e.addEventListener('click', function (e) {
			group = e.target.id;
			togglePage();
			showCard(0);
		});
	});
	
	document.querySelectorAll('#page-card #option > *[ref]').forEach(function ($e) {

		$e.addEventListener('click', function (e) {
			this.toggleAttribute('pushed');
			const $div = document.querySelector('#page-card #' + this.getAttribute('ref'));
			console.log(this.getAttribute('ref'), $div);	
			$div.style.visibility = $div.style.visibility == 'hidden' ? 'visible' : 'hidden';
		});
	});


	function speakText(text) {
		var utterance = new SpeechSynthesisUtterance(text);
		utterance.voice = voice;
		utterance.rate = 0.8;
		speechSynthesis.speak(utterance);
	};

	function loadVoices () {
		voice = speechSynthesis.getVoices()
			.find((e, i) => i > 0 && e.lang.indexOf('en') == 0 && (e.lang.indexOf('US') != -1 || e.lang.indexOf('UK') != -1 || e.lang.indexOf('GB') != -1));
	}

	navigator.mediaDevices.getUserMedia({audio: true}).then (function (stream) {
		var recognition = new webkitSpeechRecognition();
		
		recognition.continuous = true;
		recognition.interimResults = false;
		recognition.lang = 'en';
		
		function start() {
			recognition.start();
			$button.setAttribute('hold', true);
		}
		
		function stop () {
			recognition.stop();
			$button.removeAttribute('hold');			
		}

		$button.addEventListener('mousedown', start);
		$button.addEventListener('touchstart', start);

		$button.addEventListener('mouseup', stop);
		$button.addEventListener('touchend', stop);
		
		recognition.onresult = function (event) {
			var answer = event.results[0][0].transcript.toLowerCase();
			$answer.innerHTML = answer;
			if (answer == data[group][cardNo].word || data[group][cardNo].alt && data[group][cardNo].alt.indexOf(answer) != -1) {
				if (cardNo < data[group].length - 1) {
					$success.play();
					showCard(cardNo + 1);
				} else {
					$tada.play();
					togglePage();
				}	
			}
		}
		recognition.onerror = err => $error.innerHTML = err.message;
		
	}).catch((err) => alert(err.message));
	
	
	function showCard(no) {
		cardNo = no;
		var curr = data[group][cardNo];
		$image.style.backgroundImage = `url('images/${group}/${curr.word}.jpg')`;
		$word.innerHTML = curr.word;
		$translate.innerHTML = curr.translate;
		$answer.innerHTML = '&nbsp;';
	}
	
	function togglePage() {
		document.querySelectorAll('.page').forEach($e => $e.toggleAttribute('current'));
	}
});