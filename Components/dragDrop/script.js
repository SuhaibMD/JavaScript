const dragArea = document.querySelector('.drag-area');
const dragHead = document.querySelector('.header');
const dragSupport = document.querySelector('.support');
const browseBtn = document.querySelector('.button');
const inputBrse = document.querySelector('.fileBrowse');

browseBtn.addEventListener('click', () =>{
    inputBrse.click();
})

let dragHeadContent = dragHead.textContent;
let dragSupportContent = dragSupport.textContent;
let file;
//when the file is inside the drag area

dragArea.addEventListener("dragover", dragOverFn);
dragArea.addEventListener("dragleave", dragLeftFn);
dragArea.addEventListener("drop", dragDropFn);


function dragOverFn(event) {
    event.preventDefault();
    // console.log("DragOver")
    dragHead.textContent = "Release to insert";
    dragArea.classList.add("active");
    dragSupport.textContent = "";
}

function dragLeftFn(event) {
    event.preventDefault();
    // console.log("DragLeft")
    dragArea.classList.remove("active");
    dragHead.textContent = dragHeadContent;
    dragSupport.textContent = dragSupportContent;
}

function dragDropFn(event) {
    event.preventDefault();
    file = event.dataTransfer.files[0];
    console.log(file)
    let fileType = file.type;
    console.log(fileType);
    let validExtensions = ['image/jpeg', 'image/jpg', 'image/png'];
    if (validExtensions.includes(fileType)) {
        let fileReader = new FileReader();
        fileReader.onload = () => {
            let fileURL = fileReader.result;
            console.log("onload called");

            let imgTag = `<img src="${fileURL}" alt="">`;
dragArea.innerHTML = imgTag;
        }
        fileReader.readAsDataURL(file);
    }
    else {
        alert("Do, Please upload sepcifies format")
    }

    // console.log("Droppped")
}