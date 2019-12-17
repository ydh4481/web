function showBig(val) {
  var obj = document.getElementById("big");
  obj.src = val;
}

var file=document.getElementById('upload_img');
file.addEventListener('click',function(){
  var image=file.files[0];
  var reader=new FileReader();
  reader.readAsDataURL(image);
  reader.onload=function(){
    document.getElementById('main_img_1').src=reader.result;
  };
};)
