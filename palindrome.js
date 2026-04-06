let str="hello";
let reversed=str.split("").reverse().join("");
if(str===reversed){
    console.log("palindrome")
}
else
{
    console.log("Not palindrome");
}