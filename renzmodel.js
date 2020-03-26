const classes = ['Renz Carlo Salanga', 'Remy Salanga', 'Rei Cedrix Salanga', 'Cesar Salanga', 'Alvin Malicdem'];

function getFaceImageUri(className, idx) {
  return `trainingdata/${className}/${className}-${idx}.png`;
}

async function createRenzFaceMatcher(numImagesForTraining = 1) {
  const maxAvailableImagesPerClass = 5;
  numImagesForTraining = Math.min(numImagesForTraining, maxAvailableImagesPerClass)

  const labeledFaceDescriptors = await Promise.all(classes.map(
    async className => {
      const descriptors = []
      for (let i = 1; i < (numImagesForTraining + 1); i++) {
        const img = await faceapi.fetchImage(getFaceImageUri(className, i))
        descriptors.push(await faceapi.computeFaceDescriptor(img))
      }

      return new faceapi.LabeledFaceDescriptors(
        className,
        descriptors
      )
    }
  ));

  return new faceapi.FaceMatcher(labeledFaceDescriptors)
}