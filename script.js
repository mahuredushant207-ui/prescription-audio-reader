/* =========================
   GLOBAL VARIABLES
========================= */

let voices = [];

let currentText = "";


const speech =
    window.speechSynthesis;


const voiceSelect =
    document.getElementById("voice");


const speed =
    document.getElementById("speed");


const speedValue =
    document.getElementById("speedValue");


const imageInput =
    document.getElementById(
        "prescriptionImage"
    );


const imagePreview =
    document.getElementById(
        "imagePreview"
    );


const imagePreviewContainer =
    document.getElementById(
        "imagePreviewContainer"
    );


const ocrStatus =
    document.getElementById(
        "ocrStatus"
    );



/* =========================
   IMAGE PREVIEW
========================= */

imageInput.addEventListener(
    "change",
    function () {

        const file =
            imageInput.files[0];


        if (!file) {

            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                imagePreview.src =
                    event.target.result;

                imagePreviewContainer.style.display =
                    "block";
            };


        reader.readAsDataURL(file);

    }
);



/* =========================
   LOAD VOICES
========================= */

function loadVoices() {

    voices =
        speech.getVoices();


    voiceSelect.innerHTML =
        "";


    if (voices.length === 0) {

        const option =
            document.createElement(
                "option"
            );


        option.textContent =
            "Default Voice";


        voiceSelect.appendChild(
            option
        );


        return;
    }


    voices.forEach(
        function (voice, index) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                index;


            option.textContent =
                voice.name +
                " - " +
                voice.lang;


            voiceSelect.appendChild(
                option
            );

        }
    );
}


loadVoices();


if (
    speech.onvoiceschanged
    !== undefined
) {

    speech.onvoiceschanged =
        loadVoices;
}



/* =========================
   SPEED
========================= */

speed.addEventListener(
    "input",
    function () {

        speedValue.textContent =
            speed.value;

    }
);



/* =========================
   OCR
========================= */

async function extractText() {

    const file =
        imageInput.files[0];


    if (!file) {

        alert(
            "Please upload a prescription image first."
        );

        return;
    }


    ocrStatus.textContent =
        "⏳ Reading prescription image... Please wait.";


    try {

        const result =
            await Tesseract.recognize(
                file,
                "eng",
                {

                    logger:
                        function (info) {

                            if (
                                info.status
                                ===
                                "recognizing text"
                            ) {

                                const progress =
                                    Math.round(
                                        info.progress
                                        * 100
                                    );


                                ocrStatus.textContent =
                                    "🔍 Reading text: "
                                    +
                                    progress
                                    +
                                    "%";
                            }

                        }

                }
            );


        const extractedText =
            result.data.text.trim();


        if (
            extractedText === ""
        ) {

            ocrStatus.textContent =
                "❌ No readable text found. Please upload a clearer image.";

            return;
        }


        document
            .getElementById(
                "prescription"
            )
            .value =
            extractedText;


        document
            .getElementById(
                "preview"
            )
            .textContent =
            extractedText;


        ocrStatus.textContent =
            "✅ Prescription text extracted successfully.";


    }

    catch (error) {

        console.error(error);


        ocrStatus.textContent =
            "❌ Unable to read the image. Please try a clearer image.";

    }

}



/* =========================
   GENERATE AUDIO
========================= */

function generateAudio() {

    const patient =
        document
        .getElementById(
            "patientName"
        )
        .value
        .trim();


    const prescription =
        document
        .getElementById(
            "prescription"
        )
        .value
        .trim();


    if (
        prescription === ""
    ) {

        alert(
            "Please enter or upload a prescription first."
        );

        return;
    }


    currentText = "";


    if (
        patient !== ""
    ) {

        currentText +=
            "Prescription for "
            +
            patient
            +
            ". ";
    }


    currentText +=
        prescription;


    document
        .getElementById(
            "preview"
        )
        .textContent =
        currentText;


    playAudio();

}



/* =========================
   PLAY AUDIO
========================= */

function playAudio() {

    if (
        currentText === ""
    ) {

        const prescription =
            document
            .getElementById(
                "prescription"
            )
            .value
            .trim();


        if (
            prescription === ""
        ) {

            alert(
                "Please enter a prescription."
            );

            return;
        }


        const patient =
            document
            .getElementById(
                "patientName"
            )
            .value
            .trim();


        if (
            patient !== ""
        ) {

            currentText =
                "Prescription for "
                +
                patient
                +
                ". ";
        }


        currentText +=
            prescription;


        document
            .getElementById(
                "preview"
            )
            .textContent =
            currentText;
    }


    speech.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            currentText
        );


    const selectedIndex =
        voiceSelect.value;


    if (
        voices[selectedIndex]
    ) {

        utterance.voice =
            voices[selectedIndex];


        utterance.lang =
            voices[selectedIndex].lang;
    }


    utterance.rate =
        parseFloat(
            speed.value
        );


    utterance.pitch =
        1;


    utterance.volume =
        1;


    speech.speak(
        utterance
    );

}



/* =========================
   PAUSE
========================= */

function pauseAudio() {

    if (
        speech.speaking
    ) {

        speech.pause();
    }

}



/* =========================
   RESUME
========================= */

function resumeAudio() {

    if (
        speech.paused
    ) {

        speech.resume();
    }

}



/* =========================
   STOP
========================= */

function stopAudio() {

    speech.cancel();

}