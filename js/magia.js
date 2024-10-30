const url_modulo = './face-api.js-master/weights';

const canvas = document.querySelector('#canvas');
const video = document.querySelector('#video');

video.addEventListener("loadedmetadata", () => onplay());
(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
})();

async function onplay() {

    await faceapi.loadSsdMobilenetv1Model(url_modulo);
    await faceapi.loadFaceLandmarkModel(url_modulo);
    await faceapi.loadFaceRecognitionModel(url_modulo);
    await faceapi.loadFaceExpressionModel(url_modulo);
    await faceapi.loadAgeGenderModel(url_modulo);


    let descripcionesCaras = await faceapi.detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions()
        .withAgeAndGender();

    console.log(descripcionesCaras);

    const dimensiones = faceapi.matchDimensions(canvas, video, true);
    const escalarResultados = faceapi.resizeResults(descripcionesCaras, dimensiones);

    faceapi.draw.drawDetections(canvas, escalarResultados);
    faceapi.draw.drawFaceLandmarks(canvas, escalarResultados);
    faceapi.draw.drawFaceExpressions(canvas, escalarResultados, 0.05);

    escalarResultados.forEach(deteccion => {
        const caja = deteccion.detection.box;
        const infocaja = new faceapi.draw.DrawBox(
            caja,
            {
            label: Math.round(deteccion.age) + " años"+ (deteccion.gender == 'male' ? ' Masculino' : ' Femenino')
            }
        );
        infocaja.draw(canvas);
    });
    document.querySelector("video").setAttribute("style","")
    console.log("se actualizó")
}
setInterval(() => { onplay() }, 1000)