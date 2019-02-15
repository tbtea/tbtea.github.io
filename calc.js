var exp = "";
var afterEq = false; 

function retrieveNums(datap){
    exp = exp + datap; 
    document.getElementById("iData").value = exp;
    afterEq = false; 
}

function clearOut(){

    if (afterEq == false){
    exp = exp.substring(0, exp.length-1);
    document.getElementById("iData").value=exp;
    }
    else{
    exp = "";
    document.getElementById("iData").value="";
    document.getElementById("answer").value="";
    }
}

function checkInput(){
    var expression = document.getElementById("iData").value
   try{
    document.getElementById("iData").value = "= " + eval(expression);  
    document.getElementById("answer").value = expression; 
    exp = eval(expression);
    afterEq = true; 
}
    catch(e){
        document.getElementById("answer").value="Err";
    }
}

