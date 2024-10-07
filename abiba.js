
// --- Speech Recognition Code ---
const micButton = document.querySelector('.mic');
const createdTextBox = document.querySelector('.created-text');
let recognition;

micButton.addEventListener('click', () => {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Start speech recognition
    recognition.start();

    // Limit recording time to 10 seconds
    const maxRecordingTime = 10000; // 10 seconds
    const recognitionTimeout = setTimeout(() => {
        recognition.stop();
    }, maxRecordingTime);

    recognition.onresult = (event) => {
        clearTimeout(recognitionTimeout);
        const spokenText = event.results[0][0].transcript;
        createdTextBox.value = spokenText; // Display the recognized text
        playAnimation(spokenText); // Trigger animations based on the recognized text
    };

    recognition.onend = () => {
        clearTimeout(recognitionTimeout);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error: ", event.error);
    };
});

// --- Three.js Model Loading and Animation Code ---



// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Set camera distance

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.querySelector('.animation-part').appendChild(renderer.domElement); // Append to your container

// Create the GLTFLoader instance (no import needed)
const loader = new THREE.GLTFLoader();

const mixers = [];
let currentModels = [];

// Object to store loaded models and their animations
const models = {};

// List of letters to load
const letters = "abcdefghijklmnopqrstuvwxyz".split('');

// Load all models and store them in the `models` object with their animations
letters.forEach(letter => {
    loader.load(`http://localhost:8000/models/Letter_v.glb`, function (gltf) {
        models[letter] = {
            scene: gltf.scene,
            animations: gltf.animations
        };
    });
});

// Function to play animations based on recognized text
function playAnimation(text) {
    currentModels.forEach(model => {
        scene.remove(model);
    });
    currentModels = [];
    mixers.length = 0;

    text.split('').forEach((char, index) => {
        const letter = char.toLowerCase();

        if (models[letter]) {
            const modelData = models[letter];
            const model = modelData.scene.clone();

            model.position.set(index * 1.5, 0, 0);
            scene.add(model);
            currentModels.push(model);

            const mixer = new THREE.AnimationMixer(model);
            mixers.push(mixer);

            if (modelData.animations.length > 0) {
                const action = mixer.clipAction(modelData.animations[0]);
                action.play();
            }
        }
    });
}

// Animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    mixers.forEach(mixer => mixer.update(delta));

    renderer.render(scene, camera);
}

animate();
