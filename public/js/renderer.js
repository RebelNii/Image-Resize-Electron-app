

const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


function loadImage(e){
  const file = e.target.files[0];
  const accept = ['image/gif','image/png', 'image/jpeg'];
  if(accept.includes(file['type'])){
    console.log(file)
    form.style.display = 'block'
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'Downloads', 'sort') 

    //set width and height input fields to original height and width of file
    const newImg = new Image();
    newImg.src = URL.createObjectURL(file);
    newImg.onload = function(){
      widthInput.value = this.width,
      heightInput.value = this.height
    }

    
    return file;
  }else{
    console.log('Please select Image');
    errorAlerts('Please Select an Image')
    return;
  }

};


function resizeFile(e){
  e.preventDefault();
  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;
  if(!img.files[0]){
    errorAlerts('Please Select Image');
    return;
  }

  if(width === '' || height === ''){
    errorAlerts('Please fill in width and height values');
    return;
  }

  ipcRenderer.send('image:resize', {
    imgPath, width, height
  })

  ipcRenderer.on('image:done', () => {
    successAlerts('Image Resized Successfully')
  })
}

function errorAlerts(message){
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center'
    }
  })
}

function successAlerts(message){
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center'
    }
  })
}

//listen for when a user selects an image
img.addEventListener('change', loadImage)
form.addEventListener('submit', resizeFile)