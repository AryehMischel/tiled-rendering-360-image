const delay = ms => new Promise(res => setTimeout(res, ms));
var canvas
var ScaleWidth = 2048
var ScaleHeight = 1024
// let firstMessage = false

const WorkMode = {
  "init": "init",
  "mono": 0,
  "stereo": 1,
  "resize-scaling": 2
  // 0: "mono",
  // 1: "stereo",
  // 2: 2,
  // 3: 3
}


onmessage = async (evt) => {

  if (evt.data.inputMode == "init") {
    canvas = evt.data.canvas;

  }

  else if (canvas == undefined) {
    console.log("no canvas selected. select one.")
    return;
  }

  console.log("worker is messaged", evt.data.inputMode)
  // console.log(WorkMode["mono"])
  // const imageURLS = evt.data.imageURLS;
  // const imageSizes = evt.data.imageSizes;
  const inputMode = evt.data.inputMode;


  switch (WorkMode[evt.data.inputMode]) {

    case 0:
      console.log("mono")
      mono(evt.data.imageURLS)
      break;
    case 1:
      console.log("stereo")
      stereo(evt.data.imageURLS)
      break;
    case 2:
      console.log("resizing canvas...")
      ScaleHeight = evt.data.canvasHeight
      ScaleWidth = evt.data.canvasHeight * 2
      canvas.width = ScaleWidth
      canvas.height = ScaleHeight




  }


  // skies =  [s, s, s, s, s, ]

  // s = [[a], [ab], etc ] 

  // operating meshes  [a, b, a, b, a, b]

  //one sky per image

  //for image in images
  //    


  async function mono(imageURLS) {


    // determineLineSegments(); //this code will be done in the main thread

    let Segments = 4


    // nextStep(canvas, imageURLS, imageSizes, inputMode)

    sliceImages(imageURLS)
    // resizeSliceImages(imageURLS)

  }




  async function stereo(imageURLS) {





    sliceResizeImageStereo(imageURLS)

    // nextStep(canvas, imageURLS, imageSizes, inputMode)












  }


  async function sliceImages(imageURLS) {
    let ctx = canvas.getContext("2d");
    const lineSegments = 16;

    for (let i = 0; i < imageURLS.length; i++) {
      const imgblob = await fetch(imageURLS[i])
        .then(r => r.blob());
      const img = await createImageBitmap(imgblob)

      canvas.height = img.height
      canvas.width = img.width / lineSegments;

      for (let i = 1; i <= lineSegments; i++) {
        await delay(500);
        ctx.drawImage(img, img.width - canvas.width * i, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)

        canvas.convertToBlob().then((blob) => {
          postMessage({ blob })
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          

        })

			  



      }


    }

  }








  async function resizeSliceImages(imageURLS) {
    let ctx = canvas.getContext("2d");
    const lineSegments = 4;
    canvas.width = ScaleWidth / lineSegments

    for (let i = 0; i < imageURLS.length; i++) {
      const imgblob = await fetch(imageURLS[i])
        .then(r => r.blob());
      const img = await createImageBitmap(imgblob)
      let imgWidth = img.width;

      let scaleFactor = Math.max(canvas.width / img.width, canvas.height / img.height);
      console.log(scaleFactor)

      let newWidth = img.width * scaleFactor;
      let newHeight = img.height * scaleFactor;

      let x = (canvas.width / 2) - (newWidth / 2);
      let y = (canvas.height / 2) - (newHeight / 2);


      for (let i = 1; i <= lineSegments; i++) {
        ctx.drawImage(img,
          imgWidth - (i * imgWidth / lineSegments), 0,
          (img.width / lineSegments), img.height,
          0, 0,
          newWidth / lineSegments, newHeight)

        canvas.convertToBlob().then((blob) => {
          postMessage({ blob })
          ctx.clearRect(0, 0, canvas.width, canvas.height);

        })


      }


    }

  }
}



//slicing 360 L/R photos for spherical projection. Everything should be renamed when refactoring...
//top image is left eye
//bottom image is right eye
async function sliceResizeImageStereo(imageURLS) {

  let ctx = canvas.getContext("2d");
  const lineSegments = 4;
  canvas.width = ScaleWidth / lineSegments

  for (let i = 0; i < imageURLS.length; i++) {
    const imgblob = await fetch(imageURLS[i])
      .then(r => r.blob());
    const img = await createImageBitmap(imgblob)
    let imgWidth = img.width;

    let scaleFactor = Math.max(canvas.width / img.width, canvas.height / img.height);
    // let scaleFactor = Math.max(canvas.width / img.width, canvas.height / (img.height / 2));
    
    console.log(scaleFactor)

    let newWidth = img.width * scaleFactor;
    let newHeight = img.height * scaleFactor;

    // ctx.drawImage(img, 
    //   canvas.width *2, canvas.height /2,
    //   canvas.width, canvas.height /2,
    //   0, 0,
    //   canvas.width, canvas.height /2 )

    //draw left
    for (let i = 1; i <= lineSegments; i++) {
      ctx.drawImage(img,
        imgWidth - (i * imgWidth / lineSegments), 0,
        (img.width / lineSegments), img.height/2,
        0, 0,
        canvas.width, canvas.height)

      canvas.convertToBlob().then((blob) => {
        postMessage({ blob })
        ctx.clearRect(0, 0, canvas.width, canvas.height);

      })


    }


    for (let i = 1; i <= lineSegments; i++) {
      ctx.drawImage(img,
        imgWidth - (i * imgWidth / lineSegments), img.height / 2,
        (img.width / lineSegments), img.height/2,
        0, 0,
        canvas.width, canvas.height)

      canvas.convertToBlob().then((blob) => {
        postMessage({ blob })
        ctx.clearRect(0, 0, canvas.width, canvas.height);

      })


    }


    // for (let i = 1; i <= lineSegments; i++) {
    //   ctx.drawImage(img,
    //     imgWidth - (i * imgWidth / lineSegments), 0,
    //     (img.width / lineSegments), img.height/2,
    //     0, 0,
    //     newWidth, newHeight)

    //   canvas.convertToBlob().then((blob) => {
    //     postMessage({ blob })
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);

    //   })


    // }


    //draw right
    // for (let i = 1; i <= lineSegments; i++) {
    //   ctx.drawImage(img,
    //     imgWidth - (i * imgWidth / lineSegments), 0,
    //     (img.width / lineSegments), img.height,
    //     0, 0,
    //     newWidth / lineSegments, newHeight)

    //   canvas.convertToBlob().then((blob) => {
    //     postMessage({ blob })
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);

    //   })


    // }






  }

}






