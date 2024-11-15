    const url_modulo = './face-api.js-master/weights';

    const canvas = document.querySelector('#canvas');
    const video = document.querySelector('#video');
    const loader = document.querySelector('.terminal-loader');
    const container = document.querySelector('.contenedor');

    document.addEventListener("DOMContentLoaded", async () => {

        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;

        video.addEventListener("loadedmetadata", () => {
            onplay();
        });

        async function onplay() {
            await faceapi.loadSsdMobilenetv1Model(url_modulo);
            await faceapi.loadFaceLandmarkModel(url_modulo);
            await faceapi.loadFaceRecognitionModel(url_modulo);
            await faceapi.loadFaceExpressionModel(url_modulo);
            await faceapi.loadAgeGenderModel(url_modulo);

            // Espera un breve momento para asegurarte de que el video se haya iniciado antes de la detección 

            let cara = await faceapi.fetchImage('https://scontent.fmvd1-1.fna.fbcdn.net/v/t39.30808-6/244591141_10226770643274944_5137018771220165398_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEkhGGFRfmdhA01T8v0M4fFmpCntkmOoxeakKe2SY6jF2Jka4ePoGEQpjExzmCDyCY&_nc_ohc=wz3d2VPyDCIQ7kNvgEBaaUt&_nc_zt=23&_nc_ht=scontent.fmvd1-1.fna&_nc_gid=AHd96auTuPKHxAowvYRk1i6&oh=00_AYBF8gKCbaxhv7ZHH0F5i5uKm4Hc-MPJ0k2YS-3kZwglLg&oe=672EAC8C');
            // poner link de la imagen de ustedes
            let caraReferencia = await faceapi.detectAllFaces(cara)
                .withFaceLandmarks()
                .withFaceDescriptors()
                .withFaceExpressions()
                .withAgeAndGender();
            
            let descripcionesCaras = await faceapi.detectAllFaces(video)
                .withFaceLandmarks()
                .withFaceDescriptors()
                .withFaceExpressions()
                .withAgeAndGender();

            //console.log(descripcionesCaras);

            let detectorCaras = new faceapi.FaceMatcher(caraReferencia)

            const dimensiones = faceapi.matchDimensions(canvas, video, true);
            const escalarResultados = faceapi.resizeResults(descripcionesCaras, dimensiones);

            faceapi.draw.drawDetections(canvas, escalarResultados);
            faceapi.draw.drawFaceLandmarks(canvas, escalarResultados);
            faceapi.draw.drawFaceExpressions(canvas, escalarResultados, 0.05);

            escalarResultados.forEach(deteccion => {
                const caja = deteccion.detection.box
        
                const {detection, descriptor} = deteccion
                let etiqueta = detectorCaras.findBestMatch(descriptor).toString()
                console.log(etiqueta)
        
                const infoCaja = new faceapi.draw.DrawBox(
                    caja, 
                    {
                        label: Math.round(deteccion.age) + ' años - '
                            + (deteccion.gender == 'male' ? 'Masculino' : 'Femenino')
                            + (!etiqueta.includes('unknown') ? ' - Lautaro' : ' - Desconocido')
                            //poner nombre de la persona de la foto
                    } 
                )
        
                infoCaja.draw(canvas)
            })
        
            loader.style.display = 'none';
            container.style.display = 'block';

        }


        setInterval(() => { onplay() }, 1000);
    });
